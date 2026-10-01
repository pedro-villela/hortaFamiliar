// Rotas de canteiros
const express = require('express');
const db = require('../config/database');
const { autenticar, autorizar } = require('../middlewares/auth');
const { ErroHttp, texto, numeroPositivo, idDaRota } = require('../../../../hortaFamiliar/backend/src/utils/validacao');

const router = express.Router();
router.use(autenticar);

function lerCanteiro(body) {

}

// GET /api/canteiros
router.get('/', async (req, res) => {

});

// GET /api/canteiros/:id
router.get('/:id', async (req, res) => {

});

// POST /api/canteiros — ***somente ADMIN***
router.post('/', autorizar('ADMIN'), async (req, res) => {

});

// PUT /api/canteiros/:id — ***somente ADMIN***
router.put('/:id', autorizar('ADMIN'), async (req, res) => {

});

// DELETE /api/canteiros/:id — ***somente ADMIN***
router.delete('/:id', autorizar('ADMIN'), async (req, res) => {

});

module.exports = router;
