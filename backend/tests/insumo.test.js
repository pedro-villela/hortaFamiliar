const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Gestão de Insumos e Regras de Negócio', () => {
  let tokenAdmin;

  beforeAll(() => {
    tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });
  });

  it('CT04 - Deve rejeitar o cadastro de insumo com estoque negativo', async () => {
    const res = await request(app)
      .post('/api/insumos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Adubo Orgânico',
        tipo: 'FERTILIZANTE',
        quantidade_estoque: -5,
        estoque_minimo: 2
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.erro).toBe('O "quantidade_estoque" não pode ser negativo');
  });

  it('CT08 - Deve reduzir o estoque corretamente após utilização em um plantio', async () => {
    // 1. Cadastra uma cultura, um canteiro e um insumo com estoque inicial 50
    const resCultura = await request(app)
      .post('/api/culturas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: `Alface Teste CT08 ${Date.now()}`,
        tempo_maturacao_dias: 45,
        espacamento_ideal: 0.3
      });

    const resCanteiro = await request(app)
      .post('/api/canteiros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        identificacao: `Canteiro CT08 ${Date.now()}`,
        area_m2: 10
      });

    const resInsumo = await request(app)
      .post('/api/insumos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Sementes de Alface',
        tipo: 'SEMENTE',
        quantidade_estoque: 50,
        estoque_minimo: 10
      });

    expect(resInsumo.statusCode).toEqual(201);
    const idInsumo = resInsumo.body.id_insumo;

    // 2. Registra um plantio utilizando 15 unidades desse insumo
    const resPlantio = await request(app)
      .post('/api/plantios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_cultura: resCultura.body.id_cultura,
        id_canteiro: resCanteiro.body.id_canteiro,
        data_plantio: '2026-10-01',
        status: 'CRESCIMENTO',
        insumos: [
          { id_insumo: idInsumo, quantidade: 15 }
        ]
      });

    expect(resPlantio.statusCode).toEqual(201);

    // 3. Consulta o insumo novamente e verifica se o estoque caiu de 50 para 35
    const resConsulta = await request(app)
      .get(`/api/insumos/${idInsumo}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(resConsulta.statusCode).toEqual(200);
    expect(resConsulta.body.quantidade_estoque).toEqual(35);
  });
});