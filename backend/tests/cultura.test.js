const request = require('supertest');
const app = require('../src/server');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Gestão de Culturas e Canteiros', () => {
  it('CT03 - Administrador cadastra uma cultura com dados válidos', async () => {
    const tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });
    
    const res = await request(app)
      .post('/api/culturas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Tomate Cereja',
        tempoMaturacaoDias: 60,
        espacamentoCm: 30
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nome).toBe('Tomate Cereja');
  });
});
