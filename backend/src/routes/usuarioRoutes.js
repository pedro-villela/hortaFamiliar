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

// POST /api/usuarios — cria usuário
router.post('/', async (req, res) => {

});

module.exports = router;