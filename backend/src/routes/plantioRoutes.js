// Rotas de plantios.

const express = require('express');

const db = require('../config/database');

const {
    autenticar,
    autorizar
} = require('../middlewares/auth');

const {
    ErroHttp,
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

    try {
        const { rows } = await db.query(
            `INSERT INTO plantio
                (
                    id_cultura,
                    id_canteiro,
                    data_plantio,
                    status,
                    peso_colhido
                )
             VALUES
                ($1, $2, $3, $4, $5)
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
                dados.peso_colhido
            ]
        );

        res.status(201).json(rows[0]);

    } catch (err) {
        erroDeReferencia(err);
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

