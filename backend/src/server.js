/// Importa o framework Express.
// Ele será utilizado para criar nossa API.
const express = require('express');

// Importa as rotas relacionadas à verificação da API.
const healthRoutes = require('./routes/healthRoutes');
// Importa as rotas relacionadas às culturas.
const culturaRoutes = require('./routes/culturaRoutes');

// Cria uma aplicação Express.
const app = express();

// Define a porta em que o servidor ficará disponível.
const PORT = 3000;

// Permite que o Express interprete requisições
// que contenham dados no formato JSON.
app.use(express.json());

// Registra as rotas de verificação da API.
//
// Quando uma requisição chegar em:
// GET /
//
// o Express irá encaminhá-la para healthRoutes.
app.use('/', healthRoutes);
// Registra as rotas de culturas.
// A partir daqui, as rotas de cultura começarão com /api/culturas.
app.use('/api/culturas', culturaRoutes);    

// Inicia o servidor.
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});