const request = require('supertest');
const app = require('../src/server');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Gestão de Plantios', () => {
  it('CT05 - Administrador registra um plantio relacionando cultura e canteiro', async () => {
    const tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });
    
    const res = await request(app)
      .post('/api/plantios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        culturaId: 1,
        canteiroId: 2,
        dataPlantio: '2026-10-02',
        status: 'ATIVO'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.culturaId).toEqual(1);
    expect(res.body.canteiroId).toEqual(2);
  });
});
