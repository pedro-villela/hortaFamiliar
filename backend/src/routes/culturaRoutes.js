// Importa o Router do Express.
// O Router permite organizar as rotas da API em arquivos separados.
const express = require('express');
const db = require('../config/database');
const { autenticar, autorizar } = require('../middlewares/auth');
const { ErroHttp, texto, inteiroPositivo, numeroPositivo, idDaRota } = require('../utils/validacao');

const router = express.Router();
router.use(autenticar);


// Valida o corpo da requisição.
function lerCultura(body) {
    return {
        nome: texto(body.nome, 'nome', 100),
        tempo: inteiroPositivo(body.tempo_maturacao_dias, 'tempo_maturacao_dias'),
        espacamento: numeroPositivo(body.espacamento_ideal, 'espacamento_ideal')
    };
}

// GET /api/culturas 
router.get('/', async (req, res) => {
    const { rows } = await db.query('SELECT * FROM cultura ORDER BY nome');
    res.json(rows);
});

// GET /api/culturas/:id
router.get('/:id', async (req, res) => {
    const { rows } = await db.query('SELECT * FROM cultura WHERE id_cultura = $1', [idDaRota(req)]);
    if (rows.length === 0) throw new ErroHttp(404, 'Cultura não encontrada.');
    res.json(rows[0]);
});

// POST /api/culturas — ***somente ADMIN***
router.post('/', autorizar('ADMIN'), async (req, res) => {
    const c = lerCultura(req.body);
    try {
        const { rows } = await db.query(
            `INSERT INTO cultura (nome, tempo_maturacao_dias, espacamento_ideal)
             VALUES ($1, $2, $3) RETURNING *`,
            [c.nome, c.tempo, c.espacamento]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') throw new ErroHttp(409, 'Já existe uma cultura com este nome.');
        throw err;
    }
});

// PUT /api/culturas/:id — ***somente ADMIN***
router.put('/:id', autorizar('ADMIN'), async (req, res) => {
    const c = lerCultura(req.body);
    try {
        const { rows } = await db.query(
            `UPDATE cultura SET nome = $1, tempo_maturacao_dias = $2, espacamento_ideal = $3
             WHERE id_cultura = $4 RETURNING *`,
            [c.nome, c.tempo, c.espacamento, idDaRota(req)]
        );
        if (rows.length === 0) throw new ErroHttp(404, 'Cultura não encontrada.');
        res.json(rows[0]);
    } catch (err) {
        if (err.code === '23505') throw new ErroHttp(409, 'Já existe uma cultura com este nome.');
        throw err;
    }
});

// DELETE /api/culturas/:id — ***somente ADMIN***
router.delete('/:id', autorizar('ADMIN'), async (req, res) => {
    try {
        const { rowCount } = await db.query('DELETE FROM cultura WHERE id_cultura = $1', [idDaRota(req)]);
        if (rowCount === 0) throw new ErroHttp(404, 'Cultura não encontrada.');
        res.status(204).end();
    } catch (err) {
        if (err.code === '23503') throw new ErroHttp(409, 'Não é possível excluir: a cultura possui plantios vinculados.');
        throw err;
    }
});

module.exports = router;