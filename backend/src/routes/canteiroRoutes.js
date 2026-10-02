// Rotas de canteiros.

const express = require('express');

const db = require('../config/database');

const { autenticar, autorizar } = require('../middlewares/auth');

const {
    ErroHttp,
    texto,
    numeroPositivo,
    idDaRota
} = require('../utils/validacao');

const router = express.Router();

router.use(autenticar);

// ============================================================
// VALIDAÇÃO
// ============================================================

function lerCanteiro(body) {
    return {
        identificacao: texto(
            body.identificacao,
            'identificacao',
            50
        ),

        area_m2: numeroPositivo(
            body.area_m2,
            'area_m2'
        )
    };
}

// ============================================================
// LISTAR CANTEIROS
// GET /api/canteiros
// ============================================================

router.get('/', async (req, res) => {
    const { rows } = await db.query(
        `SELECT id_canteiro, identificacao, area_m2
         FROM canteiro
         ORDER BY id_canteiro`
    );

    res.json(rows);
});

// ============================================================
// BUSCAR CANTEIRO POR ID
// GET /api/canteiros/:id
// ============================================================

router.get('/:id', async (req, res) => {
    const id = idDaRota(req);

    const { rows } = await db.query(
        `SELECT id_canteiro, identificacao, area_m2
         FROM canteiro
         WHERE id_canteiro = $1`,
        [id]
    );

    if (rows.length === 0) {
        throw new ErroHttp(
            404,
            'Canteiro não encontrado.'
        );
    }

    res.json(rows[0]);
});

// ============================================================
// CADASTRAR CANTEIRO
// POST /api/canteiros
// Somente ADMIN
// ============================================================

router.post('/', autorizar('ADMIN'), async (req, res) => {
    const dados = lerCanteiro(req.body);

    try {
        const { rows } = await db.query(
            `INSERT INTO canteiro
                (identificacao, area_m2)
             VALUES
                ($1, $2)
             RETURNING
                id_canteiro,
                identificacao,
                area_m2`,
            [
                dados.identificacao,
                dados.area_m2
            ]
        );

        res.status(201).json(rows[0]);

    } catch (erro) {

        // Violação da restrição UNIQUE da identificação.
        if (erro.code === '23505') {
            throw new ErroHttp(
                409,
                'Já existe um canteiro com esta identificação.'
            );
        }

        throw erro;
    }
});

// ============================================================
// ALTERAR CANTEIRO
// PUT /api/canteiros/:id
// Somente ADMIN
// ============================================================

router.put('/:id', autorizar('ADMIN'), async (req, res) => {
    const id = idDaRota(req);
    const dados = lerCanteiro(req.body);

    try {
        const { rows } = await db.query(
            `UPDATE canteiro
             SET
                identificacao = $1,
                area_m2 = $2
             WHERE id_canteiro = $3
             RETURNING
                id_canteiro,
                identificacao,
                area_m2`,
            [
                dados.identificacao,
                dados.area_m2,
                id
            ]
        );

        if (rows.length === 0) {
            throw new ErroHttp(
                404,
                'Canteiro não encontrado.'
            );
        }

        res.json(rows[0]);

    } catch (erro) {

        // Violação da restrição UNIQUE.
        if (erro.code === '23505') {
            throw new ErroHttp(
                409,
                'Já existe outro canteiro com esta identificação.'
            );
        }

        throw erro;
    }
});

// ============================================================
// EXCLUIR CANTEIRO
// DELETE /api/canteiros/:id
// Somente ADMIN
// ============================================================

router.delete('/:id', autorizar('ADMIN'), async (req, res) => {
    const id = idDaRota(req);

    try {
        const { rowCount } = await db.query(
            `DELETE FROM canteiro
             WHERE id_canteiro = $1`,
            [id]
        );

        if (rowCount === 0) {
            throw new ErroHttp(
                404,
                'Canteiro não encontrado.'
            );
        }

        res.status(204).end();

    } catch (erro) {

        // O banco possui outros registros relacionados ao canteiro.
        if (erro.code === '23503') {
            throw new ErroHttp(
                409,
                'Não é possível excluir este canteiro porque existem registros relacionados a ele.'
            );
        }

        throw erro;
    }
});

module.exports = router;

