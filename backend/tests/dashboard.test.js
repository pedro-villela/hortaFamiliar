const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Dashboard e Relatórios', () => {
  let tokenAdmin;

  beforeAll(() => {
    tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });
  });

  it('CT11 - Administrador consulta o dashboard agrupando dados por cultura e canteiro', async () => {
    const res = await request(app)
      .get('/api/dashboard/producao?data_inicio=2026-01-01&data_fim=2026-12-31')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('produtividadePorCulturaECanteiro');
    expect(Array.isArray(res.body.produtividadePorCulturaECanteiro)).toBe(true);
  });

  it('CT12 - Administrador consulta o resumo do estoque alertando itens abaixo do mínimo', async () => {
    const res = await request(app)
      .get('/api/dashboard/estoque')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('resumo');
    expect(res.body.resumo).toHaveProperty('insumos_em_risco');
    expect(Array.isArray(res.body.estoque)).toBe(true);
  });
});