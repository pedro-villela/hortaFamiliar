// Rotas de plantios.

const express = require('express');

const db = require('../config/database');

const {
    autenticar,
    autorizar
} = require('../middlewares/auth');

const {
    ErroHttp,
    numeroPositivo,
    inteiroPositivo,
    data,
    opcao,
    numeroNaoNegativo,
    idDaRota
} = require('../utils/validacao');

const router = express.Router();

router.use(autenticar);

const STATUS = [
    'CRESCIMENTO',
    'COLHIDO',
    'PERDIDO'
];

function lerPlantio(body) {
    return {
        id_cultura: inteiroPositivo(
            body.id_cultura,
            'id_cultura'
        ),

        id_canteiro: inteiroPositivo(
            body.id_canteiro,
            'id_canteiro'
        ),

        data_plantio: data(
            body.data_plantio,
            'data_plantio'
        ),

        status: opcao(
            body.status,
            'status',
            STATUS
        ),

        peso_colhido: numeroNaoNegativo(
            body.peso_colhido,
            'peso_colhido'
        )
    };
}

// Valida a lista e soma linhas repetidas do mesmo insumo.
function lerInsumos(body) {
    const entrada = body.insumos === undefined ? [] : body.insumos;
    if (!Array.isArray(entrada)) throw new ErroHttp(400, 'O campo "insumos" deve ser uma lista.');
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

function erroDeReferencia(err) {
    if (err.code === '23503') {
        throw new ErroHttp(
            400,
            'A cultura ou o canteiro informado não existe.'
        );
    }

    throw err;
}

const SELECT_PLANTIO = `
    SELECT
        p.id_plantio,
        p.id_cultura,
        c.nome AS cultura,
        p.id_canteiro,
        cn.identificacao AS canteiro,
        p.data_plantio,
        p.status,
        p.peso_colhido
    FROM plantio p
    JOIN cultura c
        ON c.id_cultura = p.id_cultura
    JOIN canteiro cn
        ON cn.id_canteiro = p.id_canteiro
`;

// GET /api/plantios
router.get('/', async (req, res) => {
    const { rows } = await db.query(
        `${SELECT_PLANTIO}
         ORDER BY p.data_plantio DESC, p.id_plantio DESC`
    );

    res.json(rows);
});

// GET /api/plantios/:id
router.get('/:id', async (req, res) => {
    const id = idDaRota(req);

    const { rows } = await db.query(
        `${SELECT_PLANTIO}
         WHERE p.id_plantio = $1`,
        [id]
    );

    if (rows.length === 0) {
        throw new ErroHttp(
            404,
            'Plantio não encontrado.'
        );
    }

    res.json(rows[0]);
});

// POST /api/plantios — somente ADMIN
router.post('/', autorizar('ADMIN'), async (req, res) => {
    const dados = lerPlantio(req.body);
    const insumosReq = lerInsumos(req.body);
    const client = await db.pool.connect();
    let transacaoIniciada = false;

    try {
        await client.query('BEGIN');
        transacaoIniciada = true;

        const ids = insumosReq.map(item => item.id_insumo);
        const estoqueRows = ids.length
            ? await client.query(
                `SELECT id_insumo, nome, tipo, quantidade_estoque, estoque_minimo
                 FROM insumo WHERE id_insumo = ANY($1::int[])
                 ORDER BY id_insumo FOR UPDATE`, [ids])
            : { rows: [] };
        const estoquePorId = new Map(estoqueRows.rows.map(row => [row.id_insumo, row]));
        const alertas = [];

        for (const item of insumosReq) {
            const estoque = estoquePorId.get(item.id_insumo);
            if (!estoque) throw new ErroHttp(404, `Insumo ID ${item.id_insumo} não encontrado.`);
            if (estoque.tipo === 'FERRAMENTA') {
                throw new ErroHttp(400, ` '${estoque.nome}' é uma ferramenta reutilizável e não pode ser registrada como consumível do plantio. Registre ferramentas como reserva de tarefa.`);
            }
            if (item.quantidade > estoque.quantidade_estoque) {
                throw new ErroHttp(400, `Estoque insuficiente para '${estoque.nome}'. Disponível: ${estoque.quantidade_estoque}; solicitado: ${item.quantidade}.`);
            }
            if ((estoque.quantidade_estoque - item.quantidade) < estoque.estoque_minimo) {
                alertas.push(`Atenção: o estoque de '${estoque.nome}' ficará abaixo do mínimo após este plantio.`);
            }
        }

        const resPlantio = await client.query(
            `INSERT INTO plantio (id_cultura, id_canteiro, data_plantio, status, peso_colhido)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id_plantio, id_cultura, id_canteiro, data_plantio, status, peso_colhido`,
            [dados.id_cultura, dados.id_canteiro, dados.data_plantio, dados.status, dados.peso_colhido]
        );
        const novoPlantio = resPlantio.rows[0];

        // O gatilho fn_atualiza_estoque desconta o consumível automaticamente.
        for (const item of insumosReq) {
            await client.query(
                `INSERT INTO plantio_insumo (id_plantio, id_insumo, quantidade_utilizada)
                 VALUES ($1, $2, $3)`,
                [novoPlantio.id_plantio, item.id_insumo, item.quantidade]
            );
        }

        await client.query('COMMIT');
        transacaoIniciada = false;
        res.status(201).json({
            mensagem: 'Plantio registrado com sucesso.',
            plantio: novoPlantio,
            alertas: alertas.length ? alertas : undefined
        });
    } catch (err) {
        if (transacaoIniciada) await client.query('ROLLBACK');
        erroDeReferencia(err);
    } finally {
        client.release();
    }
});

// PUT /api/plantios/:id — somente ADMIN
router.put('/:id', autorizar('ADMIN'), async (req, res) => {
    const id = idDaRota(req);
    const dados = lerPlantio(req.body);

    try {
        const { rows } = await db.query(
            `UPDATE plantio
             SET
                id_cultura = $1,
                id_canteiro = $2,
                data_plantio = $3,
                status = $4,
                peso_colhido = $5
             WHERE id_plantio = $6
             RETURNING
                id_plantio,
                id_cultura,
                id_canteiro,
                data_plantio,
                status,
                peso_colhido`,
            [
                dados.id_cultura,
                dados.id_canteiro,
                dados.data_plantio,
                dados.status,
                dados.peso_colhido,
                id
            ]
        );

        if (rows.length === 0) {
            throw new ErroHttp(
                404,
                'Plantio não encontrado.'
            );
        }

        res.json(rows[0]);

    } catch (err) {
        erroDeReferencia(err);
    }
});

// DELETE /api/plantios/:id — somente ADMIN
router.delete('/:id', autorizar('ADMIN'), async (req, res) => {
    const id = idDaRota(req);

    try {
        const { rowCount } = await db.query(
            `DELETE FROM plantio
             WHERE id_plantio = $1`,
            [id]
        );

        if (rowCount === 0) {
            throw new ErroHttp(
                404,
                'Plantio não encontrado.'
            );
        }

        res.status(204).end();

    } catch (err) {

        if (err.code === '23503') {
            throw new ErroHttp(
                409,
                'Não é possível excluir este plantio porque existem insumos vinculados.'
            );
        }

        throw err;
    }
});

module.exports = router;


