const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Gestão de Plantios', () => {
  it('CT05 - Administrador registra um plantio relacionando cultura e canteiro', async () => {
    const tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });

    // Cria cultura e canteiro válidos antes de registrar o plantio
    const resCultura = await request(app)
      .post('/api/culturas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: `Cultura Plantio ${Date.now()}`,
        tempo_maturacao_dias: 45,
        espacamento_ideal: 0.25
      });

    const resCanteiro = await request(app)
      .post('/api/canteiros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        identificacao: `Canteiro Plantio ${Date.now()}`,
        area_m2: 12.5
      });

    const idCultura = resCultura.body.id_cultura;
    const idCanteiro = resCanteiro.body.id_canteiro;

    const res = await request(app)
      .post('/api/plantios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_cultura: idCultura,
        id_canteiro: idCanteiro,
        data_plantio: '2026-10-02',
        status: 'CRESCIMENTO'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.plantio.id_cultura).toEqual(idCultura);
    expect(res.body.plantio.id_canteiro).toEqual(idCanteiro);
  });
});