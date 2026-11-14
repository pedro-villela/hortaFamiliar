const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Gestão de Culturas e Canteiros', () => {
  const tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });

  it('CT03 - Administrador cadastra uma cultura com dados válidos e rejeita duplicada', async () => {
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

    // Verifica bloqueio de cultura duplicada (História #2)
    const resDuplicada = await request(app)
      .post('/api/culturas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: nomeCultura,
        tempo_maturacao_dias: 60,
        espacamento_ideal: 0.30
      });

    expect(resDuplicada.statusCode).toEqual(409);
  });

  it('CT04 (Canteiro) - Administrador cadastra canteiro e rejeita identificação duplicada (História #3)', async () => {
    const identificacao = `Canteiro Norte ${Date.now()}`;

    const resCriacao = await request(app)
      .post('/api/canteiros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        identificacao,
        area_m2: 15.5
      });

    expect(resCriacao.statusCode).toEqual(201);
    expect(resCriacao.body.identificacao).toBe(identificacao);

    const resDuplicado = await request(app)
      .post('/api/canteiros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        identificacao,
        area_m2: 20.0
      });

    expect(resDuplicado.statusCode).toEqual(409);
    expect(resDuplicado.body.erro).toContain('Já existe um canteiro com esta identificação');
  });
});