// Configuração principal da aplicação Express.

const express = require('express');

const healthRoutes = require('./routes/healthRoutes');

const authRoutes = require('./routes/authRoutes');

const culturaRoutes = require('./routes/culturaRoutes');

const canteiroRoutes = require('./routes/canteiroRoutes');

const insumoRoutes = require('./routes/insumoRoutes');

const plantioRoutes = require('./routes/plantioRoutes');

const tarefaRoutes = require('./routes/tarefaRoutes');

const usuarioRoutes = require('./routes/usuarioRoutes');

const { naoEncontrado, tratarErros } = require('./middlewares/erros');

const app = express();

// Permite receber JSON no corpo das requisições.

app.use(express.json());

// Rotas públicas.

app.use('/', healthRoutes);

app.use('/api/auth', authRoutes);

// Rotas protegidas.

app.use('/api/culturas', culturaRoutes);

app.use('/api/canteiros', canteiroRoutes);

app.use('/api/insumos', insumoRoutes);

app.use('/api/plantios', plantioRoutes);

app.use('/api/tarefas', tarefaRoutes);

app.use('/api/usuarios', usuarioRoutes);

// Rota inexistente.

app.use(naoEncontrado);

// Tratamento centralizado de erros.

app.use(tratarErros);

module.exports = app;

