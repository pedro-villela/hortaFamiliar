const { traduzirErroTarefa } = require('../../src/utils/errosBanco');
const { ErroHttp } = require('../../src/utils/validacao');

describe('traduzirErroTarefa', () => {
    it('CT10 - conflito de horário no mesmo canteiro vira 409', () => {
        const erro = traduzirErroTarefa({ code: '23P01' });
        expect(erro).toBeInstanceOf(ErroHttp);
        expect(erro.status).toBe(409);
        expect(erro.message).toContain('canteiro');
        expect(erro.message).toContain('horário');
    });

    it('hora de término menor ou igual à de início vira 400', () => {
        const erro = traduzirErroTarefa({ code: '23514' });
        expect(erro.status).toBe(400);
        expect(erro.message).toContain('hora de término');
    });

    it('usuário ou canteiro inexistente vira 400', () => {
        const erro = traduzirErroTarefa({ code: '23503' });
        expect(erro.status).toBe(400);
        expect(erro.message).toContain('não existe');
    });

    it('devolve o mesmo erro quando ele não é conhecido', () => {
        const desconhecido = new Error('falha qualquer');
        expect(traduzirErroTarefa(desconhecido)).toBe(desconhecido);
    });

    it('não quebra quando recebe undefined', () => {
        expect(traduzirErroTarefa(undefined)).toBeUndefined();
    });
});
