// Importa o Router do Express.
// O Router permite organizar as rotas da API em arquivos separados.
const express = require('express');

const router = express.Router();

// ATENÇÃO - BANCO DE DADOS:
// O PostgreSQL ainda não está configurado neste projeto.
// Por isso, os dados abaixo são temporários e servem apenas
// para testar o funcionamento da API.
//
// FUTURO DESENVOLVIMENTO:
// Quando o banco estiver configurado, estes dados deverão ser
// substituídos por uma consulta à tabela "cultura" do PostgreSQL.
const culturas = [
    {
        id_cultura: 1,
        nome: 'Alface',
        tempo_maturacao_dias: 45,
        espacamento_ideal: 0.30
    },
    {
        id_cultura: 2,
        nome: 'Tomate',
        tempo_maturacao_dias: 90,
        espacamento_ideal: 0.50
    }
];

// GET /api/culturas
// Retorna a lista de culturas.
router.get('/', (req, res) => {
    res.json(culturas);
});

// Exporta as rotas para serem utilizadas pelo server.js.
module.exports = router;