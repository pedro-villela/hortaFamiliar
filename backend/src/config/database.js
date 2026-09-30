// Configuração da conexão com o PostgreSQL.
// Usa um Pool: um conjunto de conexões reaproveitadas entre as requisições.
require('dotenv').config({ quiet: true });
const { Pool, types } = require('pg');

// Por padrão o pg devolve DECIMAL como texto ("0.30") e DATE como objeto Date
// (com problemas de fuso horário). Aqui convertemos para número e "AAAA-MM-DD".
types.setTypeParser(1700, (valor) => parseFloat(valor)); // NUMERIC / DECIMAL
types.setTypeParser(1082, (valor) => valor);             // DATE

// Prioriza DATABASE_URL (como descrito no README); se não existir,
// monta a conexão a partir das variáveis DB_HOST, DB_PORT, DB_NAME etc.
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

// Função utilitária: db.query('SELECT ... WHERE id = $1', [id])
// Sempre usar parâmetros ($1, $2...) e nunca concatenar texto (evita SQL Injection).
module.exports = {
    pool,
    query: (texto, parametros) => pool.query(texto, parametros)
};
