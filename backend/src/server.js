// Inicialização do servidor HTTP.

require('dotenv').config();

const app = require('./app');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`API Horta Familiar rodando na porta ${PORT}.`);
});

