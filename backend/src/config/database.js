
require('dotenv').config({ quiet: true });

const { Pool, types } = require('pg');

types.setTypeParser(1700, (valor) => parseFloat(valor));
types.setTypeParser(1082, (valor) => valor);

function montarConfig() {
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL
        };
    }

    return {
        host: process.env.HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.NAME,
        user: process.env.USER,
        password: process.env.PASSWORD
    };
}
const pool = new Pool(montarConfig());

module.exports = {
    pool,
    query: (texto, parametros) => pool.query(texto, parametros)
};
