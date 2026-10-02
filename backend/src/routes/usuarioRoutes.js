// Gestão de usuários.

const express = require('express');

const bcrypt = require('bcryptjs');

const db = require('../config/database');

const {
    autenticar,
    autorizar
} = require('../middlewares/auth');

const {
    ErroHttp,
    texto,
    opcao,
    idDaRota
} = require('../utils/validacao');

const {
    validarSenha,
    validarEmail
} = require('./authRoutes');

const router = express.Router();

// Todas as rotas deste arquivo exigem autenticação
// e acesso de administrador.
router.use(
    autenticar,
    autorizar('ADMIN')
);

// GET /api/usuarios
router.get('/', async (req, res) => {
    const { rows } = await db.query(
        `SELECT
            id_usuario,
            nome,
            email,
            perfil
         FROM usuario
         ORDER BY nome`
    );

    res.json(rows);
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
    const id = idDaRota(req);

    const { rows } = await db.query(
        `SELECT
            id_usuario,
            nome,
            email,
            perfil
         FROM usuario
         WHERE id_usuario = $1`,
        [id]
    );

    if (rows.length === 0) {
        throw new ErroHttp(
            404,
            'Usuário não encontrado.'
        );
    }

    res.json(rows[0]);
});

// POST /api/usuarios
router.post('/', async (req, res, next) => {
    try {
        const nome = texto(
            req.body.nome,
            'nome',
            100
        );

        const email = validarEmail(
            req.body.email
        );

        const senha = validarSenha(
            req.body.senha
        );

        const perfil = opcao(
            req.body.perfil,
            'perfil',
            ['ADMIN', 'OPERACIONAL']
        );

        const senhaHash = await bcrypt.hash(
            senha,
            10
        );

        const { rows } = await db.query(
            `INSERT INTO usuario
                (nome, email, senha, perfil)
             VALUES
                ($1, $2, $3, $4)
             RETURNING
                id_usuario,
                nome,
                email,
                perfil`,
            [
                nome,
                email,
                senhaHash,
                perfil
            ]
        );

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso.',
            usuario: rows[0]
        });

    } catch (erro) {
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

// PUT /api/usuarios/:id
router.put('/:id', async (req, res, next) => {
    try {
        const id = idDaRota(req);

        const nome = texto(
            req.body.nome,
            'nome',
            100
        );

        const email = validarEmail(
            req.body.email
        );

        const perfil = opcao(
            req.body.perfil,
            'perfil',
            ['ADMIN', 'OPERACIONAL']
        );

        const { rows } = await db.query(
            `UPDATE usuario
             SET
                nome = $1,
                email = $2,
                perfil = $3
             WHERE id_usuario = $4
             RETURNING
                id_usuario,
                nome,
                email,
                perfil`,
            [
                nome,
                email,
                perfil,
                id
            ]
        );

        if (rows.length === 0) {
            throw new ErroHttp(
                404,
                'Usuário não encontrado.'
            );
        }

        res.json(rows[0]);

    } catch (erro) {
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

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
    const id = idDaRota(req);

    // Impede o administrador de excluir o próprio usuário.
    if (id === req.usuario.id_usuario) {
        throw new ErroHttp(
            400,
            'O administrador não pode excluir o próprio usuário.'
        );
    }

    const { rowCount } = await db.query(
        `DELETE FROM usuario
         WHERE id_usuario = $1`,
        [id]
    );

    if (rowCount === 0) {
        throw new ErroHttp(
            404,
            'Usuário não encontrado.'
        );
    }

    res.status(204).end();
});

module.exports = router;

