// Importa o Router do Express.
// O Router permite organizar as rotas da API em arquivos separados.
const express = require('express');

const router = express.Router();

// Rota utilizada para verificar se a API está funcionando.
//
// GET /
// Retorna uma mensagem simples para indicar que o servidor está ativo.
router.get('/', (req, res) => {
    res.json({
        mensagem: 'API Horta Familiar funcionando!'
    });
});

// Exporta as rotas para que possam ser utilizadas pelo server.js.
module.exports = router;