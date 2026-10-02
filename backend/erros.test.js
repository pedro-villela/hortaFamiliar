const { naoEncontrado, tratarErros, traduzirErro } = require('../../src/middlewares/erros');
const { ErroHttp } = require('../../src/utils/validacao');
const logger = require('../../src/utils/logger');

function criarRes(headersSent = false) {
    return {
        headersSent,
        statusCode: undefined,
        corpo: undefined,
        status(codigo) {
            this.statusCode = codigo;
            return this;
        },
        json(corpo) {
            this.corpo = corpo;
            return this;
        }
    };
}

const REQ = { method: 'POST', originalUrl: '/api/tarefas', usuario: { id_usuario: 3 } };

// Substitui o logger por coletores durante cada teste.
let registros;
let originais;

beforeEach(() => {
    registros = { error: [], warn: [] };
    originais = { error: logger.error, warn: logger.warn };
    logger.error = (mensagem, meta) => registros.error.push({ mensagem, meta });
    logger.warn = (mensagem, meta) => registros.warn.push({ mensagem, meta });
});

afterEach(() => {
    logger.error = originais.error;
    logger.warn = originais.warn;
});

function tratar(err, req = REQ, res = criarRes()) {
    let proximo;
    tratarErros(err, req, res, (e) => { proximo = e; });
    return { res, proximo };
}

describe('naoEncontrado', () => {
    it('responde 404 para rota inexistente', () => {
        const res = criarRes();
        naoEncontrado({}, res);
        expect(res.statusCode).toBe(404);
        expect(res.corpo).toEqual({ erro: 'Rota não encontrada.' });
    });
});

describe('tratarErros - respostas', () => {
    it('usa status e mensagem de um ErroHttp', () => {
        const { res } = tratar(new ErroHttp(403, 'Sem permissão.'));
        expect(res.statusCode).toBe(403);
        expect(res.corpo).toEqual({ erro: 'Sem permissão.' });
    });

    it('CT04 - registro duplicado do PostgreSQL vira 409', () => {
        const { res } = tratar({ code: '23505', message: 'duplicate key' });
        expect(res.statusCode).toBe(409);
        expect(res.corpo).toEqual({ erro: 'Registro duplicado.' });
    });

    it('violação de chave estrangeira vira 409', () => {
        const { res } = tratar({ code: '23503', message: 'fk' });
        expect(res.statusCode).toBe(409);
        expect(res.corpo.erro).toContain('dados relacionados');
    });

    it('CT10 - violação de constraint de exclusão (conflito) vira 409', () => {
        const { res } = tratar({ code: '23P01', message: 'exclusion' });
        expect(res.statusCode).toBe(409);
    });

    it('erros de dado inválido do PostgreSQL viram 400', () => {
        expect(tratar({ code: '23514', message: 'check' }).res.statusCode).toBe(400);
        expect(tratar({ code: '23502', message: 'not null' }).res.statusCode).toBe(400);
        expect(tratar({ code: '22P02', message: 'invalid input' }).res.statusCode).toBe(400);
        expect(tratar({ code: '22008', message: 'date overflow' }).res.corpo.erro).toContain('Data ou hora inválida');
    });

    it('JSON malformado no corpo vira 400', () => {
        const { res } = tratar({ type: 'entity.parse.failed', message: 'Unexpected token' });
        expect(res.statusCode).toBe(400);
        expect(res.corpo.erro).toContain('JSON inválido');
    });

    it('corpo grande demais vira 413', () => {
        const { res } = tratar({ type: 'entity.too.large', message: 'too large' });
        expect(res.statusCode).toBe(413);
    });

    it('erro inesperado vira 500 sem vazar detalhes internos', () => {
        const { res } = tratar(new Error('senha do banco: xyz123'));
        expect(res.statusCode).toBe(500);
        expect(res.corpo).toEqual({ erro: 'Erro interno do servidor.' });
        expect(JSON.stringify(res.corpo)).not.toContain('xyz123');
    });

    it('delega ao Express quando a resposta já foi enviada', () => {
        const erro = new Error('falha no meio da resposta');
        const res = criarRes(true);
        const { proximo } = tratar(erro, REQ, res);
        expect(proximo).toBe(erro);
        expect(res.statusCode).toBeUndefined();
    });
});

describe('tratarErros - log', () => {
    it('registra erro 5xx como error, com stack e contexto da requisição', () => {
        tratar(new Error('falha inesperada'));
        expect(registros.error).toHaveLength(1);
        expect(registros.warn).toHaveLength(0);
        expect(registros.error[0].mensagem).toBe('falha inesperada');
        expect(registros.error[0].meta.stack).toBeDefined();
        expect(registros.error[0].meta.url).toBe('/api/tarefas');
        expect(registros.error[0].meta.id_usuario).toBe(3);
    });

    it('registra erro 4xx como warn, sem stack', () => {
        tratar(new ErroHttp(400, 'Dados inválidos.'));
        expect(registros.warn).toHaveLength(1);
        expect(registros.error).toHaveLength(0);
        expect(registros.warn[0].meta.stack).toBeUndefined();
    });
});

describe('traduzirErro', () => {
    it('mantém a mensagem de um ErroHttp com status 500', () => {
        expect(traduzirErro(new ErroHttp(500, 'JWT_SECRET não configurado.'))).toEqual({
            status: 500,
            mensagem: 'JWT_SECRET não configurado.'
        });
    });
});
