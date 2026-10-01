// Rotas de tarefas

const express = require('express');
const db = require('../config/database');
const { autenticar, autorizar } = require('../middlewares/auth');
const { ErroHttp, texto, inteiroPositivo, data, hora, opcao, idDaRota } = require('../utils/validacao');

const router = express.Router();
router.use(autenticar);

const STATUS = ['PENDENTE', 'CONCLUIDA', 'CANCELADA'];

// Tarefa com nome do responsável e "local" (identificação do canteiro).
const SELECT_TAREFA = `
    SELECT t.id_tarefa, t.id_usuario, u.nome AS responsavel,
           t.id_canteiro, cn.identificacao AS local,
           t.descricao, t.data_tarefa, t.hora_inicio, t.hora_fim,
           t.status, t.data_conclusao
    FROM tarefa t
    JOIN usuario u ON u.id_usuario = t.id_usuario
    LEFT JOIN canteiro cn ON cn.id_canteiro = t.id_canteiro`;

function filtroStatus(req) {
    return req.query.status === undefined ? null : opcao(req.query.status, 'status', STATUS);
}

// POST /api/tarefas
router.post('/', autorizar('ADMIN'), async (req, res) => {

});

// GET /api/tarefas 
router.get('/', autorizar('ADMIN'), async (req, res) => {

});

// GET /api/tarefas/minhas
router.get('/minhas', async (req, res) => {

});

// GET /api/tarefas/:id 
router.get('/:id', async (req, res) => {

});

// PATCH /api/tarefas/:id/concluir
router.patch('/:id/concluir', async (req, res) => {

});

module.exports = router;
