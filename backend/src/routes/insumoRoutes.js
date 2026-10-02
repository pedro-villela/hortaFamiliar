// Rotas de insumos.

const express = require('express');

const db = require('../config/database');

const {
    autenticar,
    autorizar
} = require('../middlewares/auth');

const {
    ErroHttp,
    texto,
    numeroNaoNegativo,
    opcao,
    idDaRota
} = require('../utils/validacao');

const router = express.Router();

router.use(autenticar);

const TIPOS_INSUMO = [
    'SEMENTE',
    'FERTILIZANTE',
    'FERRAMENTA'
];

function lerInsumo(body) {
    return {
        nome: texto(
            body.nome,
            'nome',
            100
        ),

        tipo: opcao(
            body.tipo,
            'tipo',
            TIPOS_INSUMO
        ),

        quantidade_estoque: numeroNaoNegativo(
            body.quantidade_estoque,
            'quantidade_estoque'
        ),

        estoque_minimo: numeroNaoNegativo(
            body.estoque_minimo,
            'estoque_minimo'
        )
    };
}

// Listar todos os insumos.
router.get('/', async (req, res) => {
    const { rows } = await db.query(
        `SELECT
            id_insumo,
            nome,
            tipo,
            quantidade_estoque,
            estoque_minimo
         FROM insumo
         ORDER BY id_insumo`
    );

    res.json(rows);
});

// Buscar um insumo pelo ID.
router.get('/:id', async (req, res) => {
    const id = idDaRota(req);

    const { rows } = await db.query(
        `SELECT
            id_insumo,
            nome,
            tipo,
            quantidade_estoque,
            estoque_minimo
         FROM insumo
         WHERE id_insumo = $1`,
        [id]
    );

    if (rows.length === 0) {
        throw new ErroHttp(
            404,
            'Insumo não encontrado.'
        );
    }

    res.json(rows[0]);
});

// Cadastrar insumo.
router.post('/', autorizar('ADMIN'), async (req, res) => {
    const dados = lerInsumo(req.body);

    const { rows } = await db.query(
        `INSERT INTO insumo
            (
                nome,
                tipo,
                quantidade_estoque,
                estoque_minimo
            )
         VALUES
            ($1, $2, $3, $4)
         RETURNING
            id_insumo,
            nome,
            tipo,
            quantidade_estoque,
            estoque_minimo`,
        [
            dados.nome,
            dados.tipo,
            dados.quantidade_estoque,
            dados.estoque_minimo
        ]
    );

    res.status(201).json(rows[0]);
});

// Atualizar insumo.
router.put('/:id', autorizar('ADMIN'), async (req, res) => {
    const id = idDaRota(req);
    const dados = lerInsumo(req.body);

    const { rows } = await db.query(
        `UPDATE insumo
         SET
            nome = $1,
            tipo = $2,
            quantidade_estoque = $3,
            estoque_minimo = $4
         WHERE id_insumo = $5
         RETURNING
            id_insumo,
            nome,
            tipo,
            quantidade_estoque,
            estoque_minimo`,
        [
            dados.nome,
            dados.tipo,
            dados.quantidade_estoque,
            dados.estoque_minimo,
            id
        ]
    );

    if (rows.length === 0) {
        throw new ErroHttp(
            404,
            'Insumo não encontrado.'
        );
    }

    res.json(rows[0]);
});

// Excluir insumo.
router.delete('/:id', autorizar('ADMIN'), async (req, res) => {
    const id = idDaRota(req);

    const { rowCount } = await db.query(
        `DELETE FROM insumo
         WHERE id_insumo = $1`,
        [id]
    );

    if (rowCount === 0) {
        throw new ErroHttp(
            404,
            'Insumo não encontrado.'
        );
    }

    res.status(204).end();
});

module.exports = router;

