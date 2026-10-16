// Rotas de tarefas.
const express = require('express');
const db = require('../config/database');
const {autenticar,autorizar} = require('../middlewares/auth');
const {ErroHttp,texto,inteiroPositivo,data,hora,opcao,idDaRota} = require('../utils/validacao');

const router = express.Router();

router.use(autenticar);

const STATUS = [
    'PENDENTE',
    'CONCLUIDA',
    'CANCELADA'
];

// Tarefa com nome do responsável e identificação do canteiro.
const SELECT_TAREFA = `
    SELECT
        t.id_tarefa,
        t.id_usuario,
        u.nome AS responsavel,
        t.id_canteiro,
        cn.identificacao AS local,
        t.descricao,
        t.data_tarefa,
        t.hora_inicio,
        t.hora_fim,
        t.status,
        t.data_conclusao
    FROM tarefa t
    JOIN usuario u
        ON u.id_usuario = t.id_usuario
    LEFT JOIN canteiro cn
        ON cn.id_canteiro = t.id_canteiro
`;

function filtroStatus(req) {
    return req.query.status === undefined
        ? null
        : opcao(
            req.query.status,
            'status',
            STATUS
        );
}

function lerTarefa(body) {
    return {
        id_usuario: inteiroPositivo( body.id_usuario, 'id_usuario' ),
        id_canteiro:
            body.id_canteiro === undefined ||
            body.id_canteiro === null ||
            body.id_canteiro === '' 
            ? null : inteiroPositivo( body.id_canteiro, 'id_canteiro' ),

        descricao: texto( body.descricao, 'descricao', 255 ),
        data_tarefa: data( body.data_tarefa, 'data_tarefa' ),
        hora_inicio: hora( body.hora_inicio, 'hora_inicio' ),
        hora_fim: hora( body.hora_fim, 'hora_fim'),
        status: opcao( body.status || 'PENDENTE', 'status', STATUS )
    };
}

function tratarErroBanco(err) {

    switch (err.code) {
        // Usuário ou canteiro informado não existe.
        case '23503':throw new ErroHttp( 400, 'O usuário ou o canteiro informado não existe.' );
        // Horário inválido ou conflito de horário.
        case '23P01':throw new ErroHttp( 409, 'Já existe uma tarefa agendada para este canteiro nesse horário.' );
        // hora_fim precisa ser maior que hora_inicio.
        case '23514':throw new ErroHttp( 400, 'A hora de término deve ser maior que a hora de início.' );
    }

    throw err;
}

// POST /api/tarefas
// Somente ADMIN pode criar e atribuir tarefas.
router.post('/', autorizar('ADMIN'), async (req, res) => {
    const dados = lerTarefa(req.body);
    const insumosReq = req.body.insumos || []; 

    const client = await db.pool.connect(); 

    try {
        await client.query('BEGIN'); // Inicia a transação.

        // IDENTIFICAR CONFLITOS DE RECURSOS (FERRAMENTAS)
        if (insumosReq.length > 0) {
            const idsInsumos = insumosReq.map(i => i.id_insumo);
            
            const conflito = await client.query(`
                SELECT t.id_tarefa, i.nome
                FROM tarefa t
                JOIN tarefa_insumo ti ON ti.id_tarefa = t.id_tarefa
                JOIN insumo i ON i.id_insumo = ti.id_insumo
                WHERE i.tipo = 'FERRAMENTA'
                  AND ti.id_insumo = ANY($1::int[])
                  AND t.data_tarefa = $2
                  AND t.hora_inicio < $4 
                  AND t.hora_fim > $3
                  AND t.status != 'CANCELADA'
            `, [idsInsumos, dados.data_tarefa, dados.hora_inicio, dados.hora_fim]);

            if (conflito.rows.length > 0) {
                throw new ErroHttp(409, `Conflito de agendamento: A ferramenta '${conflito.rows[0].nome}' já está reservada neste horário (Tarefa #${conflito.rows[0].id_tarefa}).`);
            }
        }

        // VALIDAÇÃO DE ESTOQUE E ALERTAS DE MÍNIMO
        const alertas = [];
        
        for (const item of insumosReq) {
            const resInsumo = await client.query(
                'SELECT nome, quantidade_estoque, estoque_minimo FROM insumo WHERE id_insumo = $1',
                [item.id_insumo]
            );

            if (resInsumo.rows.length === 0) {
                throw new ErroHttp(404, `Insumo ID ${item.id_insumo} não encontrado.`);
            }

            const insumoBanco = resInsumo.rows[0];

            // Bloqueia se não houver saldo suficiente.
            if (item.quantidade > insumoBanco.quantidade_estoque) {
                throw new ErroHttp(400, `Estoque insuficiente para o insumo: ${insumoBanco.nome}. Disponível: ${insumoBanco.quantidade_estoque}.`);
            }

            // Gera alerta se o uso deixar o estoque abaixo do mínimo.
            if ((insumoBanco.quantidade_estoque - item.quantidade) < insumoBanco.estoque_minimo) {
                alertas.push(`Atenção: O estoque de '${insumoBanco.nome}' atingirá um nível abaixo do mínimo após esta tarefa.`);
            }
        }

        // Grava a tarefa 
        const resTarefa = await client.query(
            `INSERT INTO tarefa
                (
                    id_usuario,
                    id_canteiro,
                    descricao,
                    data_tarefa,
                    hora_inicio,
                    hora_fim,
                    status
                )
             VALUES
                ($1, $2, $3, $4, $5, $6, $7)
             RETURNING
                id_tarefa,
                id_usuario,
                id_canteiro,
                descricao,
                data_tarefa,
                hora_inicio,
                hora_fim,
                status,
                data_conclusao`,
            [
                dados.id_usuario,
                dados.id_canteiro,
                dados.descricao,
                dados.data_tarefa,
                dados.hora_inicio,
                dados.hora_fim,
                dados.status
            ]
        );

        const novaTarefa = resTarefa.rows[0];

        // REGISTRAR UTILIZAÇÃO E REDUZIR ESTOQUE
        for (const item of insumosReq) {
            await client.query(
                `INSERT INTO tarefa_insumo (id_tarefa, id_insumo, quantidade_utilizada)
                 VALUES ($1, $2, $3)`,
                [novaTarefa.id_tarefa, item.id_insumo, item.quantidade]
            );
        }

        await client.query('COMMIT'); 

        // Retorna a tarefa criada e embute os alertas no JSON.
        res.status(201).json({
            mensagem: 'Tarefa agendada com sucesso.',
            tarefa: novaTarefa,
            alertas: alertas.length > 0 ? alertas : undefined
        });

    } catch (err) {
        await client.query('ROLLBACK'); 
        tratarErroBanco(err); // Trata conflito de canteiro.
    } finally {
        client.release();
    }
});

// GET /api/tarefas
// Somente ADMIN pode consultar todas as tarefas.
router.get('/', autorizar('ADMIN'), async (req, res) => {
    const { rows } = await db.query(
        `${SELECT_TAREFA}
         WHERE (
             $1::text IS NULL
             OR t.status = $1
         )
         ORDER BY
             t.data_tarefa,
             t.hora_inicio`,
        [filtroStatus(req)]
    );

    res.json(rows);
});

// GET /api/tarefas/minhas
// Retorna somente as tarefas do usuário autenticado.
router.get('/minhas', async (req, res) => {
    const { rows } = await db.query(
        `${SELECT_TAREFA}
         WHERE t.id_usuario = $1
         ORDER BY
             t.data_tarefa,
             t.hora_inicio`,
        [req.usuario.id_usuario]
    );

    res.json(rows);
});

// GET /api/tarefas/:id
// ADMIN pode consultar qualquer tarefa.
// Usuário OPERACIONAL somente a própria tarefa.
router.get('/:id', async (req, res) => {
    const id = idDaRota(req);

    const { rows } = await db.query(
        `${SELECT_TAREFA}
         WHERE t.id_tarefa = $1`,
        [id]
    );

    if (rows.length === 0) {
        throw new ErroHttp(
            404,
            'Tarefa não encontrada.'
        );
    }

    const tarefa = rows[0];

    if (
        req.usuario.perfil !== 'ADMIN' &&
        tarefa.id_usuario !== req.usuario.id_usuario
    ) {
        throw new ErroHttp(
            403,
            'Você não possui permissão para visualizar esta tarefa.'
        );
    }

    res.json(tarefa);
});

// PATCH /api/tarefas/:id/concluir
// O responsável pela tarefa ou um ADMIN pode concluí-la.
router.patch('/:id/concluir', async (req, res) => {
    const id = idDaRota(req);

    const tarefa = await db.query(
        `SELECT
            id_tarefa,
            id_usuario,
            status
         FROM tarefa
         WHERE id_tarefa = $1`,
        [id]
    );

    if (tarefa.rows.length === 0) {
        throw new ErroHttp(
            404,
            'Tarefa não encontrada.'
        );
    }

    const dados = tarefa.rows[0];

    if (
        req.usuario.perfil !== 'ADMIN' &&
        dados.id_usuario !== req.usuario.id_usuario
    ) {
        throw new ErroHttp(
            403,
            'Você não possui permissão para concluir esta tarefa.'
        );
    }

    if (dados.status === 'CONCLUIDA') {
        throw new ErroHttp(
            400,
            'Esta tarefa já está concluída.'
        );
    }

    if (dados.status === 'CANCELADA') {
        throw new ErroHttp(
            400,
            'Uma tarefa cancelada não pode ser concluída.'
        );
    }

    const { rows } = await db.query(
        `UPDATE tarefa
         SET
            status = 'CONCLUIDA',
            data_conclusao = CURRENT_TIMESTAMP
         WHERE id_tarefa = $1
         RETURNING
            id_tarefa,
            id_usuario,
            id_canteiro,
            descricao,
            data_tarefa,
            hora_inicio,
            hora_fim,
            status,
            data_conclusao`,
        [id]
    );

    res.json(rows[0]);
});

module.exports = router;

