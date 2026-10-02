const request = require('supertest');
const app = require('../src/server');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Atribuição e Conclusão de Tarefas', () => {
  it('CT06 - Administrador cria e atribui uma tarefa a um membro', async () => {
    const tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });
    
    const res = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        descricao: 'Regar canteiro principal',
        canteiroId: 1,
        usuarioId: 2, // ID do membro atribuído
        data: '2026-10-05T08:00:00Z'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.usuarioId).toEqual(2);
  });

  it('CT07 - Membro visualiza e conclui sua própria tarefa', async () => {
    const tokenMembro = gerarTokenSimulado({ perfil: 'OPERACIONAL', id: 2 });
    
    const res = await request(app)
      .patch('/api/tarefas/1/concluir') // Supondo tarefa ID 1
      .set('Authorization', `Bearer ${tokenMembro}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('CONCLUIDA');
  });
});
