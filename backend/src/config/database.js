// Configuração da conexão com o PostgreSQL.
require('dotenv').config({ quiet: true });
const { Pool, types } = require('pg');

types.setTypeParser(1700, (valor) => parseFloat(valor)); 
types.setTypeParser(1082, (valor) => valor);            

function montarConfig() {
    if (process.env.DATABASE_URL) {
        return { connectionString: process.env.DATABASE_URL };
    }
    return {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    };
}

const pool = new Pool(montarConfig());

module.exports = {
    pool,
    query: (texto, parametros) => pool.query(texto, parametros)
};
