// Roda uma vez antes de todos os testes: recria o banco de TESTES do zero
// aplicando o mesmo database/schema.sql usado em produção.
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

module.exports = async () => {
    const urlTeste = process.env.DATABASE_URL_TEST;
    if (!urlTeste) throw new Error('Defina DATABASE_URL_TEST no .env para rodar os testes.');
    const url = new URL(urlTeste);
    const nome = url.pathname.slice(1);
    // Trava de segurança: nunca apagar um banco que não seja de teste.
    if (!nome.endsWith('_test')) throw new Error(`O banco de testes deve terminar em "_test" (recebido: ${nome}).`);

    const adminUrl = new URL(urlTeste);
    adminUrl.pathname = '/postgres';
    const admin = new Client({ connectionString: adminUrl.toString() });
    await admin.connect();
    const existe = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [nome]);
    if (existe.rowCount === 0) await admin.query(`CREATE DATABASE "${nome}"`);
    await admin.end();

    const client = new Client({ connectionString: urlTeste });
    await client.connect();
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await client.query(fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf8'));
    await client.end();
};
