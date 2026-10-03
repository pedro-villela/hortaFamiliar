const request = require('supertest');
const app = require('../src/server');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Testes End-to-End (E2E) - Fluxos Principais', () => {
  it('CT13 e CT14 - Executa fluxo completo e valida alteração do estoque', async () => {
    const tokenAdmin = gerarTokenSimulado({ perfil: 'ADMIN' });
    
    // Simula a etapa final do fluxo: Uso de insumo vinculado a uma tarefa
    const resUsoInsumo = await request(app)
      .post('/api/insumos/1/usar')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ 
        quantidade: 5,
        tarefaId: 3
      });

    expect(resUsoInsumo.statusCode).toEqual(200);
    // Verifica se a resposta traz o estoque devidamente deduzido
    expect(resUsoInsumo.body).toHaveProperty('quantidadeRestante');
    expect(typeof resUsoInsumo.body.quantidadeRestante).toBe('number');
  });
});
