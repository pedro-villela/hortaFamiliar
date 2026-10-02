const request = require('supertest');
const app = require('../src/app'); // Caminho para o seu arquivo principal do Express
const { gerarTokenSimulado } = require('./utils/testHelpers'); // Função simulada para testes

describe('Autenticação e Controle de Acesso', () => {
  
  it('CT01 - Deve autenticar o usuário com dados válidos e retornar um token JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@hortafamiliar.com',
        senha: 'senhaSegura123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('CT02 - Deve bloquear acesso de perfil OPERACIONAL a uma rota de ADMIN', async () => {
    const tokenOperacional = gerarTokenSimulado({ perfil: 'OPERACIONAL' });

    const res = await request(app)
      .post('/api/admin/configuracoes')
      .set('Authorization', `Bearer ${tokenOperacional}`)
      .send({ chave: 'valor' });

    expect(res.statusCode).toEqual(403);
    expect(res.body.erro).toBe('Acesso negado: Requer privilégios de administrador.');
  });
});
