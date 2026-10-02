const request = require('supertest');
const app = require('../src/server');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Dashboard e Relatórios', () => {
  let tokenAdmin;

  beforeAll(() => {
    tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });
  });

  it('CT11 - Administrador consulta o dashboard agrupando dados por cultura', async () => {
    const res = await request(app)
      .get('/api/dashboard/producao')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('plantiosAtivos');
    expect(Array.isArray(res.body.plantiosAtivos)).toBe(true);
  });

  it('CT12 - Administrador consulta o resumo do estoque alertando itens abaixo do mínimo', async () => {
    const res = await request(app)
      .get('/api/dashboard/estoque')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('itensAbaixoMinimo');
  });
});
