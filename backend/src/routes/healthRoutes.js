// Importa o Router do Express.
// O Router permite organizar as rotas da API em arquivos separados.
const express = require('express');
const db = require('../config/database');

const router = express.Router();

// GET /
router.get('/', (req, res) => {
    res.json({
        mensagem: 'API funcionando!'
    });
});

// GET /saude
router.get('/saude', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ api: 'ok', banco: 'conectado' });
    } catch (err) {
        res.status(503).json({ api: 'ok', banco: 'indisponível' });
    }
});


module.exports = router;