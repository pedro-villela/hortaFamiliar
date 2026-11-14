const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Testes End-to-End (E2E) - Fluxos Principais', () => {
  it('CT13 e CT14 - Executa fluxo completo e valida alteração do estoque', async () => {
    const tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });

    // 1. Cria usuário operacional
    const resUsuario = await request(app)
      .post('/api/auth/registro')
      .send({
        nome: 'Operador E2E',
        email: `e2e_${Date.now()}@horta.com`,
        senha: 'SenhaSegura123'
      });
    const idUsuario = resUsuario.body.id_usuario;

    // 2. Cria canteiro e insumo com estoque inicial 20 (mínimo 16 para gerar alerta ao cair para 15)
    const resCanteiro = await request(app)
      .post('/api/canteiros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        identificacao: `Canteiro E2E ${Date.now()}`,
        area_m2: 20
      });
    const idCanteiro = resCanteiro.body.id_canteiro;

    const resInsumo = await request(app)
      .post('/api/insumos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Fertilizante E2E',
        tipo: 'FERTILIZANTE',
        quantidade_estoque: 20,
        estoque_minimo: 16
      });
    const idInsumo = resInsumo.body.id_insumo;

    // 3. Cria tarefa utilizando 5 unidades do insumo (estoque deve cair de 20 para 15 e gerar alerta)
    const resTarefa = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_usuario: idUsuario,
        id_canteiro: idCanteiro,
        descricao: 'Adubação E2E',
        data_tarefa: '2026-11-01',
        hora_inicio: '08:00',
        hora_fim: '10:00',
        insumos: [
          { id_insumo: idInsumo, quantidade: 5 }
        ]
      });

    expect(resTarefa.statusCode).toEqual(201);
    expect(resTarefa.body.alertas[0]).toContain('abaixo do mínimo');

    // 4. Verifica se o estoque do insumo foi deduzido para 15 e marcado como abaixo_do_minimo
    const resInsumoAtualizado = await request(app)
      .get(`/api/insumos/${idInsumo}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(resInsumoAtualizado.statusCode).toEqual(200);
    expect(resInsumoAtualizado.body.quantidade_estoque).toBe(15);
    expect(resInsumoAtualizado.body.abaixo_do_minimo).toBe(true);
  });
});