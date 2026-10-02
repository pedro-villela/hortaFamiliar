// Rotas de autenticação.

const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('../config/database');

const {
    gerarToken,
    autenticar
} = require('../middlewares/auth');

const {
    ErroHttp,
    texto
} = require('../utils/validacao');

const router = express.Router();

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================
// VALIDAÇÃO DE SENHA
// ============================================================

function validarSenha(senha) {

    if (
        typeof senha !== 'string' ||
        senha.length < 8 ||
        !/[A-Za-z]/.test(senha) ||
        !/\d/.test(senha)
    ) {
        throw new ErroHttp(
            400,
            'A senha precisa ter no mínimo 8 caracteres, entre letras e números.'
        );
    }

    return senha;
}

// ============================================================
// VALIDAÇÃO DE E-MAIL
// ============================================================

function validarEmail(email) {

    const valor = texto(
        email,
        'email',
        150
    ).toLowerCase();

    if (!REGEX_EMAIL.test(valor)) {
        throw new ErroHttp(
            400,
            'E-mail inválido.'
        );
    }

    return valor;
}

// ============================================================
// REGISTRO
// POST /api/auth/registro
// ============================================================

router.post('/registro', async (req, res, next) => {

    try {

        const {
            nome,
            email,
            senha
        } = req.body;

        const nomeValido = texto(
            nome,
            'nome',
            100
        );

        const emailValido = validarEmail(email);

        validarSenha(senha);

        // Verifica se o e-mail já está cadastrado.
        const usuarioExistente = await db.query(
            `SELECT id_usuario
             FROM usuario
             WHERE email = $1`,
            [emailValido]
        );

        if (usuarioExistente.rows.length > 0) {
            throw new ErroHttp(
                409,
                'E-mail já cadastrado.'
            );
        }

        // A senha nunca é armazenada em texto puro.
        const senhaHash = await bcrypt.hash(
            senha,
            10
        );

        // Todo cadastro público começa como OPERACIONAL.
        // O perfil ADMIN deve ser definido administrativamente.
        const resultado = await db.query(
            `INSERT INTO usuario
                (nome, email, senha, perfil)
             VALUES
                ($1, $2, $3, 'OPERACIONAL')
             RETURNING
                id_usuario,
                nome,
                email,
                perfil`,
            [
                nomeValido,
                emailValido,
                senhaHash
            ]
        );

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso.',
            usuario: resultado.rows[0]
        });

    } catch (erro) {

        // E-mail UNIQUE no PostgreSQL.
        if (erro.code === '23505') {
            return next(
                new ErroHttp(
                    409,
                    'E-mail já cadastrado.'
                )
            );
        }

        next(erro);
    }
});

// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post('/login', async (req, res, next) => {

    try {

        const {
            email,
            senha
        } = req.body;

        const emailValido = validarEmail(email);

        validarSenha(senha);

        // Busca o usuário pelo e-mail.
        const resultado = await db.query(
            `SELECT
                id_usuario,
                nome,
                email,
                senha,
                perfil
             FROM usuario
             WHERE email = $1`,
            [emailValido]
        );

        if (resultado.rows.length === 0) {
            throw new ErroHttp(
                401,
                'E-mail ou senha inválidos.'
            );
        }

        const usuario = resultado.rows[0];

        // Compara a senha informada com o hash
        // armazenado no PostgreSQL.
        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            throw new ErroHttp(
                401,
                'E-mail ou senha inválidos.'
            );
        }

        const usuarioToken = {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        };

        const token = gerarToken(
            usuarioToken
        );

        res.json({
            mensagem: 'Login realizado com sucesso.',
            token,
            usuario: usuarioToken
        });

    } catch (erro) {
        next(erro);
    }
});

// ============================================================
// USUÁRIO AUTENTICADO
// GET /api/auth/me
// ============================================================

router.get(
    '/me',
    autenticar,
    async (req, res) => {

        res.json({
            usuario: req.usuario
        });
    }
);

module.exports = router;

module.exports.validarSenha = validarSenha;
module.exports.validarEmail = validarEmail;

