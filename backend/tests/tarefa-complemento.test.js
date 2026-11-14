const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Atribuição, Visualização e Conclusão de Tarefas (Histórias #6, #7 e #8)', () => {
  let tokenAdmin;
  let idMembro;
  let idOutroMembro;
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

    const resOutroMembro = await request(app)
      .post('/api/auth/registro')
      .send({
        nome: 'Outro Membro',
        email: `outro_membro_${Date.now()}@horta.com`,
        senha: 'SenhaSegura123'
      });
    idOutroMembro = resOutroMembro.body.id_usuario;

    const resCanteiro = await request(app)
      .post('/api/canteiros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        identificacao: `Canteiro Comp ${Date.now()}`,
        area_m2: 10
      });
    idCanteiro = resCanteiro.body.id_canteiro;
  });

  it('CT06 - Administrador cria e atribui uma tarefa a um membro (História #6)', async () => {
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

  it('CT07 - Membro visualiza apenas suas tarefas e conclui sua própria tarefa (Histórias #7 e #8)', async () => {
    const tokenMembro = gerarTokenSimulado({
      perfil: 'OPERACIONAL',
      id_usuario: idMembro
    });
    const tokenOutroMembro = gerarTokenSimulado({
      perfil: 'OPERACIONAL',
      id_usuario: idOutroMembro
    });

    // 1. História #7: Membro consulta suas tarefas em GET /api/tarefas/minhas
    const resMinhas = await request(app)
      .get('/api/tarefas/minhas')
      .set('Authorization', `Bearer ${tokenMembro}`);

    expect(resMinhas.statusCode).toEqual(200);
    expect(resMinhas.body.some(t => t.id_tarefa === idTarefaCriada)).toBe(true);

    // 2. História #8: Outro membro NÃO pode concluir tarefa que não é sua (403)
    const resProibido = await request(app)
      .patch(`/api/tarefas/${idTarefaCriada}/concluir`)
      .set('Authorization', `Bearer ${tokenOutroMembro}`);

    expect(resProibido.statusCode).toEqual(403);

    // 3. História #8: O próprio membro conclui sua tarefa com sucesso
    const res = await request(app)
      .patch(`/api/tarefas/${idTarefaCriada}/concluir`)
      .set('Authorization', `Bearer ${tokenMembro}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('CONCLUIDA');
    expect(res.body.data_conclusao).not.toBeNull();
  });
});