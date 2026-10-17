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

// Valida e agrega insumos repetidos para que o estoque seja conferido pela soma.
function lerInsumos(body) {
    const entrada = body.insumos === undefined ? [] : body.insumos;
    if (!Array.isArray(entrada)) {
        throw new ErroHttp(400, 'O campo "insumos" deve ser uma lista.');
    }

    const agregados = new Map();
    for (const item of entrada) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            throw new ErroHttp(400, 'Cada insumo deve conter id_insumo e quantidade.');
        }
        const id_insumo = inteiroPositivo(item.id_insumo, 'id_insumo');
        const quantidade = numeroPositivo(item.quantidade, 'quantidade');
        agregados.set(id_insumo, (agregados.get(id_insumo) || 0) + quantidade);
    }

    return [...agregados.entries()]
        .map(([id_insumo, quantidade]) => ({ id_insumo, quantidade }))
        .sort((a, b) => a.id_insumo - b.id_insumo);
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
    const insumosReq = lerInsumos(req.body);
    const client = await db.pool.connect();
    let transacaoIniciada = false;

    try {
        await client.query('BEGIN');
        transacaoIniciada = true;

        // Bloqueia as linhas em ordem consistente para impedir que duas requisições
        // consumam o mesmo estoque disponível ao mesmo tempo.
        const ids = insumosReq.map(item => item.id_insumo);
        const estoqueRows = ids.length
            ? await client.query(
                `SELECT id_insumo, nome, tipo, quantidade_estoque, estoque_minimo
                 FROM insumo
                 WHERE id_insumo = ANY($1::int[])
                 ORDER BY id_insumo
                 FOR UPDATE`, [ids])
            : { rows: [] };
        const estoquePorId = new Map(estoqueRows.rows.map(row => [row.id_insumo, row]));

        for (const item of insumosReq) {
            if (!estoquePorId.has(item.id_insumo)) {
                throw new ErroHttp(404, `Insumo ID ${item.id_insumo} não encontrado.`);
            }
        }

        const consumiveis = [];
        const ferramentas = [];
        const alertas = [];

        for (const item of insumosReq) {
            const estoque = estoquePorId.get(item.id_insumo);
            if (estoque.tipo === 'FERRAMENTA') {
                if (!Number.isInteger(item.quantidade)) {
                    throw new ErroHttp(400, `A quantidade da ferramenta '${estoque.nome}' deve ser um número inteiro.`);
                }
                ferramentas.push({ ...item, estoque });
            } else {
                if (item.quantidade > estoque.quantidade_estoque) {
                    throw new ErroHttp(400, `Estoque insuficiente para '${estoque.nome}'. Disponível: ${estoque.quantidade_estoque}; solicitado: ${item.quantidade}.`);
                }
                if ((estoque.quantidade_estoque - item.quantidade) < estoque.estoque_minimo) {
                    alertas.push(`Atenção: o estoque de '${estoque.nome}' ficará abaixo do mínimo após esta tarefa.`);
                }
                consumiveis.push({ ...item, estoque });
            }
        }

        // Ferramentas são recursos reutilizáveis. A quantidade reservada não é
        // descontada do estoque; a capacidade é verificada dentro da transação.
        const inicio = `${dados.data_tarefa} ${dados.hora_inicio}`;
        const fim = `${dados.data_tarefa} ${dados.hora_fim}`;
        for (const item of ferramentas) {
            const reserva = await client.query(
                `SELECT COALESCE(SUM(tf.quantidade), 0) AS quantidade_reservada,
                        MIN(tf.id_tarefa) AS id_tarefa
                 FROM tarefa_ferramenta tf
                 JOIN tarefa t ON t.id_tarefa = tf.id_tarefa
                 WHERE tf.id_insumo = $1
                   AND tf.ativa = TRUE
                   AND t.status <> 'CANCELADA'
                   AND tf.inicio < $3::timestamp
                   AND tf.fim > $2::timestamp`,
                [item.id_insumo, inicio, fim]
            );
            const reservada = Number(reserva.rows[0].quantidade_reservada);
            const disponivel = Number(item.estoque.quantidade_estoque) - reservada;
            if (item.quantidade > disponivel) {
                throw new ErroHttp(409, `Conflito de agendamento: a ferramenta '${item.estoque.nome}' não está disponível nesse horário. Disponível para reserva: ${Math.max(0, disponivel)}.`);
            }
        }

        const resTarefa = await client.query(
            `INSERT INTO tarefa
                (id_usuario, id_canteiro, descricao, data_tarefa, hora_inicio, hora_fim, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id_tarefa, id_usuario, id_canteiro, descricao, data_tarefa,
                       hora_inicio, hora_fim, status, data_conclusao`,
            [dados.id_usuario, dados.id_canteiro, dados.descricao, dados.data_tarefa,
             dados.hora_inicio, dados.hora_fim, dados.status]
        );
        const novaTarefa = resTarefa.rows[0];

        // O gatilho do banco desconta automaticamente os consumíveis ao inserir.
        for (const item of consumiveis) {
            await client.query(
                `INSERT INTO tarefa_insumo (id_tarefa, id_insumo, quantidade_utilizada)
                 VALUES ($1, $2, $3)`,
                [novaTarefa.id_tarefa, item.id_insumo, item.quantidade]
            );
        }

        for (const item of ferramentas) {
            await client.query(
                `INSERT INTO tarefa_ferramenta
                    (id_tarefa, id_insumo, quantidade, inicio, fim, ativa)
                 VALUES ($1, $2, $3, $4::timestamp, $5::timestamp, $6)`,
                [novaTarefa.id_tarefa, item.id_insumo, item.quantidade, inicio, fim, dados.status !== 'CANCELADA']
            );
        }

        await client.query('COMMIT');
        transacaoIniciada = false;
        res.status(201).json({
            mensagem: 'Tarefa agendada com sucesso.',
            tarefa: novaTarefa,
            alertas: alertas.length ? alertas : undefined
        });
    } catch (err) {
        if (transacaoIniciada) await client.query('ROLLBACK');
        tratarErroBanco(err);
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

    await db.query(
        `UPDATE tarefa_ferramenta SET ativa = FALSE WHERE id_tarefa = $1`,
        [id]
    );

    res.json(rows[0]);
});

// PATCH /api/tarefas/:id/cancelar — cancela a tarefa e libera seus recursos.
router.patch('/:id/cancelar', async (req, res) => {
    const id = idDaRota(req);
    const client = await db.pool.connect();
    let transacaoIniciada = false;

    try {
        await client.query('BEGIN');
        transacaoIniciada = true;
        const resultado = await client.query(
            `SELECT id_tarefa, id_usuario, status
             FROM tarefa WHERE id_tarefa = $1 FOR UPDATE`, [id]
        );
        if (!resultado.rows.length) throw new ErroHttp(404, 'Tarefa não encontrada.');

        const tarefa = resultado.rows[0];
        if (req.usuario.perfil !== 'ADMIN' && tarefa.id_usuario !== req.usuario.id_usuario) {
            throw new ErroHttp(403, 'Você não possui permissão para cancelar esta tarefa.');
        }
        if (tarefa.status === 'CONCLUIDA') {
            throw new ErroHttp(400, 'Uma tarefa concluída não pode ser cancelada.');
        }
        if (tarefa.status === 'CANCELADA') {
            throw new ErroHttp(400, 'Esta tarefa já está cancelada.');
        }

        const atualizada = await client.query(
            `UPDATE tarefa SET status = 'CANCELADA'
             WHERE id_tarefa = $1
             RETURNING id_tarefa, status`, [id]
        );
        await client.query(
            'UPDATE tarefa_ferramenta SET ativa = FALSE WHERE id_tarefa = $1', [id]
        );
        // Como o estoque é descontado no agendamento, o cancelamento devolve os
        // consumíveis. O gatilho restaura o saldo ao excluir os vínculos.
        await client.query('DELETE FROM tarefa_insumo WHERE id_tarefa = $1', [id]);

        await client.query('COMMIT');
        transacaoIniciada = false;
        res.json({ mensagem: 'Tarefa cancelada e recursos liberados.', tarefa: atualizada.rows[0] });
    } catch (err) {
        if (transacaoIniciada) await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

module.exports = router;

