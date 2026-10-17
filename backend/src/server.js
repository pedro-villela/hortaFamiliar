// Inicialização do servidor HTTP.
require('dotenv').config();

const app = require('./app');
const db = require('./config/database');

if (!process.env.JWT_SECRET) {
    console.error('Defina JWT_SECRET antes de iniciar.');
    process.exit(1);
}

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, async () => {
    console.log(`API Horta Familiar rodando na porta ${PORT}.`);
    try {
        await db.query('SELECT 1');
        console.log('Conexão com o PostgreSQL estabelecida.');
    } catch (err) {
        console.error('Não foi possível conectar ao PostgreSQL:', err.message);
    }
});

module.exports = app;
