const request = require('supertest');
const app = require('../src/app');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Autenticação e Controle de Acesso', () => {
  const emailTeste = `usuario_${Date.now()}@hortafamiliar.com`;
  const senhaTeste = 'SenhaSegura123';

  beforeAll(async () => {
    // Registra o usuário no banco de testes antes de testar o login
    await request(app)
      .post('/api/auth/registro')
      .send({
        nome: 'Usuário Teste Auth',
        email: emailTeste,
        senha: senhaTeste
      });
  });

  it('CT01 - Deve autenticar o usuário com dados válidos e retornar um token JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: emailTeste,
        senha: senhaTeste
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('CT02 - Deve bloquear acesso de perfil OPERACIONAL a uma rota de ADMIN', async () => {
    const tokenOperacional = gerarTokenSimulado({ perfil: 'OPERACIONAL' });

    // Tenta acessar POST /api/culturas, que é exclusiva para ADMIN
    const res = await request(app)
      .post('/api/culturas')
      .set('Authorization', `Bearer ${tokenOperacional}`)
      .send({
        nome: 'Cultura Bloqueada',
        tempo_maturacao_dias: 30,
        espacamento_ideal: 0.2
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body.erro).toBe('Usuário não possui permissão para esta operação.');
  });
});