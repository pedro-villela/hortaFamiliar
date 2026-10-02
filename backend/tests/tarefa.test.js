const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Gestão e Agendamento de Tarefas', () => {
  let tokenAdmin;

  beforeAll(() => {
    tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });
  });

  it('CT09 - Deve bloquear o agendamento de tarefa caso não haja estoque suficiente', async () => {
    const res = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        descricao: 'Adubar canteiro A',
        insumoId: 1, // Supondo que tem 10 no estoque
        quantidadeNecessaria: 15,
        canteiroId: 2,
        data: '2026-10-15T14:00:00Z'
      });

    expect(res.statusCode).toEqual(422); // Unprocessable Entity
    expect(res.body.erro).toBe('Estoque insuficiente para o insumo selecionado.');
  });

  it('CT10 - Deve bloquear agendamento de tarefas conflitantes no mesmo canteiro e horário', async () => {
    // Passo 1: Cria a primeira tarefa com sucesso
    await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        descricao: 'Plantio matinal',
        canteiroId: 5,
        dataInicio: '2026-10-10T08:00:00Z',
        dataFim: '2026-10-10T10:00:00Z'
      });

    // Passo 2: Tenta agendar no mesmo canteiro sobrepondo o horário
    const resConflito = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        descricao: 'Manutenção',
        canteiroId: 5,
        dataInicio: '2026-10-10T09:00:00Z', // Horário conflita com a tarefa anterior
        dataFim: '2026-10-10T11:00:00Z'
      });

    expect(resConflito.statusCode).toEqual(409); // Conflict
    expect(resConflito.body.erro).toBe('Já existe uma tarefa agendada para este canteiro no período selecionado.');
  });
});
