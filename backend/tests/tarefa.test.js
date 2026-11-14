const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Gestão e Agendamento de Tarefas', () => {
  let tokenAdmin;
  let idUsuario;
  let idCanteiro;
  let idInsumo;

  beforeAll(async () => {
    tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });

    // Cria usuário, canteiro e insumo para usar nos testes de tarefa
    const resUsuario = await request(app)
      .post('/api/auth/registro')
      .send({
        nome: 'Membro Tarefa',
        email: `membro_tarefa_${Date.now()}@horta.com`,
        senha: 'SenhaSegura123'
      });
    idUsuario = resUsuario.body.id_usuario;

    const resCanteiro = await request(app)
      .post('/api/canteiros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        identificacao: `Canteiro Tarefa ${Date.now()}`,
        area_m2: 15
      });
    idCanteiro = resCanteiro.body.id_canteiro;

    const resInsumo = await request(app)
      .post('/api/insumos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Adubo Teste CT09',
        tipo: 'FERTILIZANTE',
        quantidade_estoque: 10,
        estoque_minimo: 2
      });
    idInsumo = resInsumo.body.id_insumo;
  });

  it('CT09 - Deve reter tarefa como AGUARDANDO_APROVACAO caso não haja estoque suficiente', async () => {
    const res = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_usuario: idUsuario,
        id_canteiro: idCanteiro,
        descricao: 'Adubar canteiro A',
        data_tarefa: '2026-10-15',
        hora_inicio: '14:00',
        hora_fim: '15:00',
        insumos: [
          { id_insumo: idInsumo, quantidade: 15 } // Estoque tem apenas 10
        ]
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.tarefa.status).toBe('AGUARDANDO_APROVACAO');
    expect(res.body.alertas[0]).toContain('Estoque insuficiente');
  });

  it('CT10 - Deve bloquear agendamento de tarefas conflitantes no mesmo canteiro e horário', async () => {
    // Passo 1: Cria a primeira tarefa com sucesso (08:00 às 10:00)
    const resPrimeira = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_usuario: idUsuario,
        id_canteiro: idCanteiro,
        descricao: 'Plantio matinal',
        data_tarefa: '2026-10-10',
        hora_inicio: '08:00',
        hora_fim: '10:00'
      });

    expect(resPrimeira.statusCode).toEqual(201);

    // Passo 2: Tenta agendar no mesmo canteiro sobrepondo o horário (09:00 às 11:00)
    const resConflito = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_usuario: idUsuario,
        id_canteiro: idCanteiro,
        descricao: 'Manutenção conflitante',
        data_tarefa: '2026-10-10',
        hora_inicio: '09:00',
        hora_fim: '11:00'
      });

    expect(resConflito.statusCode).toEqual(409);
    expect(resConflito.body.erro).toContain('Conflito de agendamento');
  });
});