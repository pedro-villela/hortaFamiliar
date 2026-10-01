// Gestão de usuários
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { autenticar, autorizar } = require('../middlewares/auth');
const { ErroHttp, texto, opcao } = require('../utils/validacao');
const { validarSenha, validarEmail } = require('./authRoutes');

const router = express.Router();
router.use(autenticar, autorizar('ADMIN'));

// GET /api/usuarios
router.get('/', async (req, res) => {
    const { rows } = await db.query('SELECT id_usuario, nome, email, perfil FROM usuario ORDER BY nome');
    res.json(rows);
});

// POST /api/usuarios
router.post('/', async (req, res) => {
    const nome = texto(req.body.nome, 'nome', 100);
    const email = validarEmail(req.body.email);
    const senha = validarSenha(req.body.senha);
    const perfil = opcao(req.body.perfil, 'perfil', ['ADMIN', 'OPERACIONAL']);
    const hash = await bcrypt.hash(senha, 10);
});

module.exports = router;