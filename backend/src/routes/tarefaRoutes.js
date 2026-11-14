
// Rotas de tarefas.
const express = require('express');
const db = require('../config/database');
const { autenticar, autorizar } = require('../middlewares/auth');
const {
    ErroHttp,
    texto,
    numeroPositivo,
    inteiroPositivo,
    data,
    hora,
    opcao,
    idDaRota
} = require('../utils/validacao');

const router = express.Router();

router.use(autenticar);

const STATUS = [
    'PENDENTE',
    'AGUARDANDO_APROVACAO',
    'CONCLUIDA',
    'CANCELADA'
];

const STATUS_CRIACAO = [
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
        : opcao(req.query.status, 'status', STATUS);
}

function lerTarefa(body) {
    const hora_inicio = hora(body.hora_inicio, 'hora_inicio');
    const hora_fim = hora(body.hora_fim, 'hora_fim');

    if (hora_fim.slice(0, 5) <= hora_inicio.slice(0, 5)) {
        throw new ErroHttp(
            400,
            'O horário de término deve ser posterior ao horário de início.'
        );
    }

    return {
        id_usuario: inteiroPositivo(body.id_usuario, 'id_usuario'),

        id_canteiro:
            body.id_canteiro === undefined ||
            body.id_canteiro === null ||
            body.id_canteiro === ''
                ? null
                : inteiroPositivo(body.id_canteiro, 'id_canteiro'),

        descricao: texto(body.descricao, 'descricao', 255),
        data_tarefa: data(body.data_tarefa, 'data_tarefa'),
        hora_inicio,
        hora_fim,
        status: opcao(
            body.status || 'PENDENTE',
            'status',
            STATUS_CRIACAO
        )
    };
}

// Valida e agrega insumos repetidos para conferir o estoque pela soma.
function lerInsumos(body) {
    const entrada = body.insumos === undefined ? [] : body.insumos;

    if (!Array.isArray(entrada)) {
        throw new ErroHttp(400, 'O campo "insumos" deve ser uma lista.');
    }

    const agregados = new Map();

    for (const item of entrada) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            throw new ErroHttp(
                400,
                'Cada insumo deve conter id_insumo e quantidade.'
            );
        }

        const id_insumo = inteiroPositivo(item.id_insumo, 'id_insumo');
        const quantidade = numeroPositivo(item.quantidade, 'quantidade');

        agregados.set(
            id_insumo,
            (agregados.get(id_insumo) || 0) + quantidade
        );
    }

    return [...agregados.entries()]
        .map(([id_insumo, quantidade]) => ({ id_insumo, quantidade }))
        .sort((a, b) => a.id_insumo - b.id_insumo);
}

function lerObservacao(body) {
    if (body.observacao === undefined || body.observacao === null) {
        return null;
    }

    if (
        typeof body.observacao !== 'string' ||
        body.observacao.trim().length > 500
    ) {
        throw new ErroHttp(
            400,
            'A observação deve ser um texto de até 500 caracteres.'
        );
    }

    return body.observacao.trim() || null;
}

async function tratarErroBanco(err, id_canteiro) {
    switch (err.code) {
        case '23503':
            throw new ErroHttp(
                400,
                'O usuário, o canteiro ou o insumo informado não existe.'
            );

        case '23P01': {
            if (id_canteiro === null || id_canteiro === undefined) {
                throw new ErroHttp(
                    409,
                    'Conflito de agendamento: não foi possível identificar o canteiro ocupado.'
                );
            }

            const resultado = await db.query(
                `SELECT identificacao
                 FROM canteiro
                 WHERE id_canteiro = $1`,
                [id_canteiro]
            );

            const identificacao = resultado.rows[0]?.identificacao;

            if (identificacao) {
                throw new ErroHttp(
                    409,
                    `Conflito de agendamento: o canteiro '${identificacao}' já está ocupado neste horário.`
                );
            }

            throw new ErroHttp(
                409,
                'Conflito de agendamento: o canteiro informado já está ocupado neste horário.'
            );
        }

        case '23514':
            throw new ErroHttp(
                400,
                'A operação viola uma regra de validação do banco de dados.'
            );
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

        // Bloqueia os estoques em ordem consistente para evitar
        // que requisições simultâneas consumam o mesmo saldo.
        const ids = insumosReq.map(item => item.id_insumo);

        const estoqueRows = ids.length
            ? await client.query(
                `SELECT
                    id_insumo,
                    nome,
                    tipo,
                    quantidade_estoque,
                    estoque_minimo
                 FROM insumo
                 WHERE id_insumo = ANY($1::int[])
                 ORDER BY id_insumo
                 FOR UPDATE`,
                [ids]
            )
            : { rows: [] };

        const estoquePorId = new Map(
            estoqueRows.rows.map(row => [row.id_insumo, row])
        );

        for (const item of insumosReq) {
            if (!estoquePorId.has(item.id_insumo)) {
                throw new ErroHttp(
                    404,
                    `Insumo ID ${item.id_insumo} não encontrado.`
                );
            }
        }

        const consumiveis = [];
        const ferramentas = [];
        const alertas = [];
        let precisaAprovacao = false;

        for (const item of insumosReq) {
            const estoque = estoquePorId.get(item.id_insumo);
            const quantidadeDisponivel = Number(estoque.quantidade_estoque);

            if (estoque.tipo === 'FERRAMENTA') {
                if (!Number.isInteger(item.quantidade)) {
                    throw new ErroHttp(
                        400,
                        `A quantidade da ferramenta '${estoque.nome}' deve ser um número inteiro.`
                    );
                }

                ferramentas.push({ ...item, estoque });
            } else {
                consumiveis.push({ ...item, estoque });

                if (item.quantidade > quantidadeDisponivel) {
                    precisaAprovacao = true;

                    alertas.push(
                        `Estoque insuficiente para '${estoque.nome}'. Disponível: ${quantidadeDisponivel}; solicitado: ${item.quantidade}. A tarefa aguardará aprovação administrativa.`
                    );
                } else if (
                    quantidadeDisponivel - item.quantidade <=
                    Number(estoque.estoque_minimo)
                ) {
                    alertas.push(
                        `Atenção: o estoque de '${estoque.nome}' ficará abaixo do mínimo após esta tarefa.`
                    );
                }
            }
        }

        // Ferramentas são recursos reutilizáveis.
        // A reserva não desconta a quantidade do estoque.
        const inicio = `${dados.data_tarefa} ${dados.hora_inicio}`;
        const fim = `${dados.data_tarefa} ${dados.hora_fim}`;

        for (const item of ferramentas) {
            const reserva = await client.query(
                `SELECT
                    COALESCE(SUM(tf.quantidade), 0) AS quantidade_reservada
                 FROM tarefa_ferramenta tf
                 JOIN tarefa t
                    ON t.id_tarefa = tf.id_tarefa
                 WHERE tf.id_insumo = $1
                   AND tf.ativa = TRUE
                   AND t.status <> 'CANCELADA'
                   AND tf.inicio < $3::timestamp
                   AND tf.fim > $2::timestamp`,
                [item.id_insumo, inicio, fim]
            );

            const reservada = Number(
                reserva.rows[0].quantidade_reservada
            );

            const disponivel =
                Number(item.estoque.quantidade_estoque) - reservada;

            if (item.quantidade > disponivel) {
                throw new ErroHttp(
                    409,
                    `Conflito de agendamento: a ferramenta '${item.estoque.nome}' não está disponível nesse horário. Disponível para reserva: ${Math.max(0, disponivel)}.`
                );
            }
        }

        // Se faltar estoque, a tarefa aguarda aprovação administrativa.
        const statusInicial = precisaAprovacao
            ? 'AGUARDANDO_APROVACAO'
            : dados.status;

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
             VALUES ($1, $2, $3, $4, $5, $6, $7)
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
                statusInicial
            ]
        );

        const novaTarefa = resTarefa.rows[0];

        if (precisaAprovacao) {
            // Guarda os insumos solicitados sem descontar o estoque.
            for (const item of consumiveis) {
                await client.query(
                    `INSERT INTO tarefa_insumo_pendente
                        (id_tarefa, id_insumo, quantidade)
                     VALUES ($1, $2, $3)`,
                    [
                        novaTarefa.id_tarefa,
                        item.id_insumo,
                        item.quantidade
                    ]
                );
            }
        } else {
            // O gatilho do banco desconta os consumíveis automaticamente.
            for (const item of consumiveis) {
                await client.query(
                    `INSERT INTO tarefa_insumo
                        (id_tarefa, id_insumo, quantidade_utilizada)
                     VALUES ($1, $2, $3)`,
                    [
                        novaTarefa.id_tarefa,
                        item.id_insumo,
                        item.quantidade
                    ]
                );
            }
        }

        // Registra as reservas de ferramentas, inclusive nas tarefas
        // que aguardam aprovação de estoque.
        for (const item of ferramentas) {
            await client.query(
                `INSERT INTO tarefa_ferramenta
                    (
                        id_tarefa,
                        id_insumo,
                        quantidade,
                        inicio,
                        fim,
                        ativa
                    )
                 VALUES ($1, $2, $3, $4::timestamp, $5::timestamp, $6)`,
                [
                    novaTarefa.id_tarefa,
                    item.id_insumo,
                    item.quantidade,
                    inicio,
                    fim,
                    statusInicial !== 'CANCELADA'
                ]
            );
        }

        await client.query('COMMIT');
        transacaoIniciada = false;

        res.status(201).json({
            mensagem: precisaAprovacao
                ? 'Tarefa criada e aguardando aprovação administrativa devido à insuficiência de estoque.'
                : 'Tarefa agendada com sucesso.',
            tarefa: novaTarefa,
            alertas: alertas.length ? alertas : undefined
        });
    } catch (err) {
        if (transacaoIniciada) {
            await client.query('ROLLBACK');
        }

        await tratarErroBanco(err, dados.id_canteiro);
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
        throw new ErroHttp(404, 'Tarefa não encontrada.');
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

    const insumos = await db.query(
        `SELECT
            ti.id_insumo,
            i.nome,
            i.tipo,
            ti.quantidade_utilizada
        FROM tarefa_insumo ti
        JOIN insumo i ON i.id_insumo = ti.id_insumo
        WHERE ti.id_tarefa = $1
        ORDER BY ti.id_insumo`,
        [id]
    );

    res.json({
        ...tarefa,
        insumos: insumos.rows
    });
});

// POST /api/tarefas/:id/aprovar-estoque
// Somente ADMIN pode aprovar consumo excepcional de estoque.
router.post(
    '/:id/aprovar-estoque',
    autorizar('ADMIN'),
    async (req, res) => {
        const id = idDaRota(req);
        const observacao = lerObservacao(req.body);
        const client = await db.pool.connect();

        let transacaoIniciada = false;

        try {
            await client.query('BEGIN');
            transacaoIniciada = true;

            const resultado = await client.query(
                `SELECT id_tarefa, status
                 FROM tarefa
                 WHERE id_tarefa = $1
                 FOR UPDATE`,
                [id]
            );

            if (resultado.rows.length === 0) {
                throw new ErroHttp(404, 'Tarefa não encontrada.');
            }

            const tarefa = resultado.rows[0];

            if (tarefa.status !== 'AGUARDANDO_APROVACAO') {
                throw new ErroHttp(
                    409,
                    'Esta tarefa não está aguardando aprovação de estoque.'
                );
            }

            const pendentes = await client.query(
                `SELECT id_insumo, quantidade
                 FROM tarefa_insumo_pendente
                 WHERE id_tarefa = $1
                 ORDER BY id_insumo`,
                [id]
            );

            if (pendentes.rows.length === 0) {
                throw new ErroHttp(
                    409,
                    'Não existem insumos pendentes para aprovação nesta tarefa.'
                );
            }

            // Bloqueia os estoques envolvidos antes da aprovação.
            const idsInsumos = pendentes.rows.map(
                item => item.id_insumo
            );

            const estoques = await client.query(
                `SELECT id_insumo
                 FROM insumo
                 WHERE id_insumo = ANY($1::int[])
                 ORDER BY id_insumo
                 FOR UPDATE`,
                [idsInsumos]
            );

            if (estoques.rows.length !== idsInsumos.length) {
                throw new ErroHttp(
                    409,
                    'Um ou mais insumos da tarefa não estão mais disponíveis no cadastro.'
                );
            }

            // Registra o administrador responsável pela aprovação.
            // O gatilho do banco também valida o perfil ADMIN.
            await client.query(
                `INSERT INTO tarefa_aprovacao_estoque
                    (id_tarefa, id_admin, observacao)
                 VALUES ($1, $2, $3)`,
                [
                    id,
                    req.usuario.id_usuario,
                    observacao
                ]
            );

            // O gatilho de estoque permite o saldo negativo
            // porque a aprovação já foi registrada.
            for (const item of pendentes.rows) {
                await client.query(
                    `INSERT INTO tarefa_insumo
                        (id_tarefa, id_insumo, quantidade_utilizada)
                     VALUES ($1, $2, $3)`,
                    [
                        id,
                        item.id_insumo,
                        item.quantidade
                    ]
                );
            }

            // Remove os registros temporários após o consumo.
            await client.query(
                `DELETE FROM tarefa_insumo_pendente
                 WHERE id_tarefa = $1`,
                [id]
            );

            const atualizada = await client.query(
                `UPDATE tarefa
                 SET status = 'PENDENTE'
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

            await client.query('COMMIT');
            transacaoIniciada = false;

            res.json({
                mensagem: 'Aprovação registrada. Os insumos foram descontados do estoque e a tarefa está pendente.',
                tarefa: atualizada.rows[0]
            });
        } catch (err) {
            if (transacaoIniciada) {
                await client.query('ROLLBACK');
            }

            if (err.code === '23514') {
                throw new ErroHttp(
                    409,
                    'Não foi possível concluir a aprovação devido a uma restrição de estoque ou validação do banco.'
                );
            }

            throw err;
        } finally {
            client.release();
        }
    }
);

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
        throw new ErroHttp(404, 'Tarefa não encontrada.');
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

    if (dados.status === 'AGUARDANDO_APROVACAO') {
        throw new ErroHttp(
            409,
            'Esta tarefa precisa ser aprovada pelo administrador antes de ser concluída.'
        );
    }

    if (dados.status === 'CONCLUIDA') {
        throw new ErroHttp(400, 'Esta tarefa já está concluída.');
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
        `UPDATE tarefa_ferramenta
         SET ativa = FALSE
         WHERE id_tarefa = $1`,
        [id]
    );

    res.json(rows[0]);
});

// PATCH /api/tarefas/:id/cancelar
// Cancela a tarefa e libera seus recursos.
router.patch('/:id/cancelar', async (req, res) => {
    const id = idDaRota(req);
    const client = await db.pool.connect();

    let transacaoIniciada = false;

    try {
        await client.query('BEGIN');
        transacaoIniciada = true;

        const resultado = await client.query(
            `SELECT id_tarefa, id_usuario, status
             FROM tarefa
             WHERE id_tarefa = $1
             FOR UPDATE`,
            [id]
        );

        if (!resultado.rows.length) {
            throw new ErroHttp(404, 'Tarefa não encontrada.');
        }

        const tarefa = resultado.rows[0];

        if (
            req.usuario.perfil !== 'ADMIN' &&
            tarefa.id_usuario !== req.usuario.id_usuario
        ) {
            throw new ErroHttp(
                403,
                'Você não possui permissão para cancelar esta tarefa.'
            );
        }

        if (tarefa.status === 'CONCLUIDA') {
            throw new ErroHttp(
                400,
                'Uma tarefa concluída não pode ser cancelada.'
            );
        }

        if (tarefa.status === 'CANCELADA') {
            throw new ErroHttp(400, 'Esta tarefa já está cancelada.');
        }

        const atualizada = await client.query(
            `UPDATE tarefa
             SET status = 'CANCELADA'
             WHERE id_tarefa = $1
             RETURNING id_tarefa, status`,
            [id]
        );

        await client.query(
            `UPDATE tarefa_ferramenta
             SET ativa = FALSE
             WHERE id_tarefa = $1`,
            [id]
        );

        // Remove os insumos pendentes sem alterar o estoque.
        await client.query(
            `DELETE FROM tarefa_insumo_pendente
             WHERE id_tarefa = $1`,
            [id]
        );

        // Se já houve consumo, o gatilho restaura o estoque.
        await client.query(
            `DELETE FROM tarefa_insumo
             WHERE id_tarefa = $1`,
            [id]
        );

        await client.query('COMMIT');
        transacaoIniciada = false;

        res.json({
            mensagem: 'Tarefa cancelada e recursos liberados.',
            tarefa: atualizada.rows[0]
        });
    } catch (err) {
        if (transacaoIniciada) {
            await client.query('ROLLBACK');
        }

        throw err;
    } finally {
        client.release();
    }
});

// POST /api/tarefas/:id/insumos — Registra utilização de insumos em uma tarefa (História 9)
router.post('/:id/insumos', autorizar('ADMIN'), async (req, res) => {
    const idTarefa = idDaRota(req);
    const insumosReq = lerInsumos(req.body);

    if (insumosReq.length === 0) {
        throw new ErroHttp(400, 'Informe ao menos um insumo para registrar a utilização.');
    }

    const client = await db.pool.connect();
    let transacaoIniciada = false;

    try {
        await client.query('BEGIN');
        transacaoIniciada = true;

        const tarefaRes = await client.query(
            'SELECT id_tarefa, status FROM tarefa WHERE id_tarefa = $1 FOR UPDATE',
            [idTarefa]
        );
        if (tarefaRes.rows.length === 0) {
            throw new ErroHttp(404, 'Tarefa não encontrada.');
        }
        if (tarefaRes.rows[0].status === 'CANCELADA') {
            throw new ErroHttp(400, 'Não é possível registrar utilização de insumos em uma tarefa cancelada.');
        }

        const ids = insumosReq.map(item => item.id_insumo);
        const estoqueRows = await client.query(
            `SELECT id_insumo, nome, tipo, quantidade_estoque, estoque_minimo
             FROM insumo WHERE id_insumo = ANY($1::int[])
             ORDER BY id_insumo FOR UPDATE`,
            [ids]
        );
        const estoquePorId = new Map(estoqueRows.rows.map(row => [row.id_insumo, row]));
        const alertas = [];

        for (const item of insumosReq) {
            const estoque = estoquePorId.get(item.id_insumo);
            if (!estoque) throw new ErroHttp(404, `Insumo ID ${item.id_insumo} não encontrado.`);
            if (estoque.tipo === 'FERRAMENTA') {
                throw new ErroHttp(400, `'${estoque.nome}' é uma ferramenta reutilizável e não um insumo consumível.`);
            }
            if (item.quantidade > Number(estoque.quantidade_estoque)) {
                throw new ErroHttp(400, `Estoque insuficiente para '${estoque.nome}'. Disponível: ${estoque.quantidade_estoque}; solicitado: ${item.quantidade}.`);
            }
            if ((Number(estoque.quantidade_estoque) - item.quantidade) <= Number(estoque.estoque_minimo)) {
                alertas.push(`Atenção: o estoque de '${estoque.nome}' ficará abaixo ou igual ao mínimo após esta tarefa.`);
            }
        }

        for (const item of insumosReq) {
            await client.query(
                `INSERT INTO tarefa_insumo (id_tarefa, id_insumo, quantidade_utilizada)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (id_tarefa, id_insumo)
                 DO UPDATE SET quantidade_utilizada = tarefa_insumo.quantidade_utilizada + EXCLUDED.quantidade_utilizada`,
                [idTarefa, item.id_insumo, item.quantidade]
            );
        }

        await client.query('COMMIT');
        transacaoIniciada = false;

        res.status(201).json({
            mensagem: 'Utilização de insumos registrada com sucesso na tarefa.',
            id_tarefa: idTarefa,
            insumos_registrados: insumosReq,
            alertas: alertas.length ? alertas : undefined
        });
    } catch (err) {
        if (transacaoIniciada) await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

module.exports = router;
