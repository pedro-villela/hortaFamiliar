const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Atribuição e Conclusão de Tarefas', () => {
  let tokenAdmin;
  let idMembro;
  let idCanteiro;
  let idTarefaCriada;

  beforeAll(async () => {
    tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });

    const resMembro = await request(app)
      .post('/api/auth/registro')
      .send({
        nome: 'Membro Operacional',
        email: `membro_comp_${Date.now()}@horta.com`,
        senha: 'SenhaSegura123'
      });
    idMembro = resMembro.body.id_usuario;

    const resCanteiro = await request(app)
      .post('/api/canteiros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        identificacao: `Canteiro Comp ${Date.now()}`,
        area_m2: 10
      });
    idCanteiro = resCanteiro.body.id_canteiro;
  });

  it('CT06 - Administrador cria e atribui uma tarefa a um membro', async () => {
    const res = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_usuario: idMembro,
        id_canteiro: idCanteiro,
        descricao: 'Regar canteiro principal',
        data_tarefa: '2026-10-05',
        hora_inicio: '08:00',
        hora_fim: '09:00'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.tarefa.id_usuario).toEqual(idMembro);
    idTarefaCriada = res.body.tarefa.id_tarefa;
  });

  it('CT07 - Membro visualiza e conclui sua própria tarefa', async () => {
    const tokenMembro = gerarTokenSimulado({
      perfil: 'OPERACIONAL',
      id_usuario: idMembro
    });

    const res = await request(app)
      .patch(`/api/tarefas/${idTarefaCriada}/concluir`)
      .set('Authorization', `Bearer ${tokenMembro}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('CONCLUIDA');
  });
});