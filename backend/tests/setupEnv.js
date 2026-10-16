// Faz a aplicação usar o banco de testes durante o Jest.
require('dotenv').config({ quiet: true });
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';
