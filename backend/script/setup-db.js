// Cria o banco se não existir e aplica database/schema.sql
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function configDoBanco() {
    if (process.env.DATABASE_URL) {
        const url = new URL(process.env.DATABASE_URL);
        return { url, nome: url.pathname.slice(1) };
    }
    const url = new URL(`postgres://${encodeURIComponent(process.env.USER || '')}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`);
    return { url, nome: process.env.NAME };
}

async function main() {
    const reset = process.argv.includes('--reset');
    const { url, nome } = configDoBanco();
    if (!nome) throw new Error('banco não definido.');

    // Conecta no banco postgres para poder criar.
    const adminUrl = new URL(url.toString());
    adminUrl.pathname = '/postgres';
    const admin = new Client({ connectionString: adminUrl.toString() });
    await admin.connect();
    const existe = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [nome]);
    if (existe.rowCount === 0) {
        await admin.query(`CREATE DATABASE "${nome.replace(/"/g, '""')}"`);
        console.log(`Banco "${nome}" criado.`);
    }
    await admin.end();

    // Aplica o schema.
    const client = new Client({ connectionString: url.toString() });
    await client.connect();
    if (reset) {
        await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        console.log('Schema recriado.');
    }
    const jaTemTabelas = await client.query("SELECT to_regclass('public.usuario') AS t");
    if (jaTemTabelas.rows[0].t) {
        console.log('Tabelas já existem.');
    } else {
        const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf8');
        await client.query(sql);
        console.log('Schema aplicado com sucesso.');
    }
    await client.end();
}

main().catch((erro) => { console.error('Falha no setup do banco:', erro.message); process.exit(1); });
