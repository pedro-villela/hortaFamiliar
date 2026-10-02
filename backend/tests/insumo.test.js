const request = require('supertest');
const app = require('../src/app');
const insumoService = require('../src/services/insumoService');
const logger = require('../src/utils/logger'); // Seu serviço de log (ex: Winston, Morgan)

// Espiona a função de log de erro
jest.spyOn(logger, 'error').mockImplementation(() => {});

describe('Gestão de Insumos e Regras de Negócio', () => {

  it('CT04 - Deve rejeitar o cadastro de insumo com estoque negativo e gerar log de erro', async () => {
    const res = await request(app)
      .post('/api/insumos')
      .send({
        nome: 'Adubo Orgânico',
        quantidade: -5 // Estoque negativo
      });

    // Tratamento de erro esperado
    expect(res.statusCode).toEqual(400);
    expect(res.body.erro).toBe('A quantidade de estoque não pode ser negativa.');
    
    // Verifica se o sistema registrou o log da tentativa inválida
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Tentativa de cadastro com estoque negativo'));
  });

  it('CT08 - Deve reduzir o estoque corretamente após utilização (Teste Unitário)', async () => {
    // Simulando o estado inicial no banco de dados
    const insumoMock = { id: 1, nome: 'Sementes de Alface', quantidade: 50 };
    
    // Função do service que faz a regra de negócio
    const resultado = insumoService.registrarUso(insumoMock, 15); 

    expect(resultado.quantidade).toEqual(35);
  });
});
