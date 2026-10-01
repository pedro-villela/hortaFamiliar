// Rotas de plantios
const express = require('express');
const db = require('../config/database');
const { autenticar, autorizar } = require('../middlewares/auth');
const { ErroHttp, inteiroPositivo, data, opcao, numeroNaoNegativo, idDaRota } = require('../utils/validacao');

const router = express.Router();
router.use(autenticar);

const STATUS = ['CRESCIMENTO', 'COLHIDO', 'PERDIDO'];

function lerPlantio(body) {

}

function erroDeReferencia(err) {

}

const SELECT_PLANTIO = `
    SELECT p.id_plantio, p.id_cultura, c.nome AS cultura,
           p.id_canteiro, cn.identificacao AS canteiro,
           p.data_plantio, p.status, p.peso_colhido
    FROM plantio p
    JOIN cultura c ON c.id_cultura = p.id_cultura
    JOIN canteiro cn ON cn.id_canteiro = p.id_canteiro`;

// GET /api/plantios
router.get('/', async (req, res) => {

});

// GET /api/plantios/:id
router.get('/:id', async (req, res) => {

});

// POST /api/plantios — ***somente ADMIN***
router.post('/', autorizar('ADMIN'), async (req, res) => {

});

// PUT /api/plantios/:id — ***somente ADMIN*** 
router.put('/:id', autorizar('ADMIN'), async (req, res) => {

});

// DELETE /api/plantios/:id — ***somente ADMIN***
router.delete('/:id', autorizar('ADMIN'), async (req, res) => {

});

module.exports = router;