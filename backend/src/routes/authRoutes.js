// Rotas de autenticação

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { gerarToken, autenticar } = require('../middlewares/auth');
const { ErroHttp, texto } = require('../utils/validacao');


const router = express.Router();

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Requisitos mínimos de senha: 8+ caracteres, ao menos uma letra e um número.
function validarSenha(senha) {
    if (typeof senha !== 'string' || senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
        throw new ErroHttp(400, 'A senha prcisa ter no mínimo 8 caracteres entre letras e numeros.');
    }
    return senha;
}

function validarEmail(email) {
    const valor = texto(email, 'email', 150).toLowerCase();
    if (!REGEX_EMAIL.test(valor)) throw new ErroHttp(400, 'E-mail invalido.');
    return valor;
}

// POST /api/auth/registro
router.post('/registro', async (req, res) => {

});

// POST /api/auth/login
router.post('/login', async (req, res) => {
   
});

// GET /api/auth/me
router.get('/me', autenticar, async (req, res) => {

});

module.exports = router;
module.exports.validarSenha = validarSenha;
module.exports.validarEmail = validarEmail;
