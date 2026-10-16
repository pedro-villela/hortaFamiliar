// Rotas de autenticação.
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { gerarToken, autenticar } = require('../middlewares/auth');
const {ErroHttp, texto} = require('../utils/validacao');

const router = express.Router();

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================
// VALIDAÇÃO DE SENHA
// ============================================================

function validarSenha(senha) {
    if ( typeof senha !== 'string' || senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
        throw new ErroHttp( 400, 'A senha precisa ter no mínimo 8 caracteres, entre letras e números.');
    }
    return senha;
}

// ============================================================
// VALIDAÇÃO DE E-MAIL
// ============================================================

function validarEmail(email) {
    const valor = texto( email, 'email', 150 ).toLowerCase();

    if (!REGEX_EMAIL.test(valor)) { throw new ErroHttp( 400, 'E-mail inválido.'); }
    return valor;
}

// ============================================================
// REGISTRO
// POST /api/auth/registro
// ============================================================
router.post('/registro', async (req, res, next) => {
    try {
        const nome = texto(req.body.nome, 'nome', 100);
        const email = validarEmail(req.body.email);
        const senha = validarSenha(req.body.senha);
        
        // A senha nunca é armazenada em texto puro.
        const hash = await bcrypt.hash(senha, 10);
        
        const { rows } = await db.query(
            `INSERT INTO usuario (nome, email, senha, perfil) VALUES ($1, $2, $3, 'OPERACIONAL')
             RETURNING id_usuario, nome, email, perfil`,
            [nome, email, hash]
        );
        
        res.status(201).json(rows[0]);

    } catch (err) {
        if (err.code === '23505') { return next(new ErroHttp(409, 'E-mail já cadastrado.')); }
        next(err);
    }
});

// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post('/login', async (req, res, next) => {
    try {
        const email = texto(req.body.email, 'email').toLowerCase();
        const senha = texto(req.body.senha, 'senha');

        // Busca o usuário pelo e-mail.
        const select = await db.query(
            `SELECT
                id_usuario,
                nome,
                email,
                senha,
                perfil
             FROM usuario
             WHERE email = $1`,
            [email]
        );

        const usuario = select.rows[0];
        
        // Compara a senha informada com o hash
        if (!usuario || !(bcrypt.compare( senha, usuario.senha ))) {
            throw new ErroHttp( 401, 'E-mail ou senha inválidos.' );
        }

        const token = gerarToken(usuario);

        res.json({
            mensagem: 'Login realizado com sucesso.',
            token: token,
            usuario: { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
        });

    } catch (erro) {
        next(erro);
    }
});

// ============================================================
// USUÁRIO AUTENTICADO
// GET /api/auth/me
// ============================================================
router.get('/me', autenticar, async (req, res) => {
    const { rows } = await db.query(
        'SELECT id_usuario, nome, email, perfil FROM usuario WHERE id_usuario = $1', 
        [req.usuario.id_usuario]
    );
    
    if (rows.length === 0) throw new ErroHttp(401, 'Usuário não existe mais.');
    res.json(rows[0]);
});

module.exports = router;
module.exports.validarSenha = validarSenha;
module.exports.validarEmail = validarEmail;

