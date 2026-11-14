const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Gestão de Culturas e Canteiros', () => {
  it('CT03 - Administrador cadastra uma cultura com dados válidos', async () => {
    const tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });
    const nomeCultura = `Tomate Cereja ${Date.now()}`;

    const res = await request(app)
      .post('/api/culturas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: nomeCultura,
        tempo_maturacao_dias: 60,
        espacamento_ideal: 0.30
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id_cultura');
    expect(res.body.nome).toBe(nomeCultura);
  });
});