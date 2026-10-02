const { EventEmitter } = require('events');
const { registrarRequisicoes } = require('../../src/middlewares/requisicoes');
const logger = require('../../src/utils/logger');

let coletados;
let infoOriginal;

beforeEach(() => {
    coletados = [];
    infoOriginal = logger.info;
    logger.info = (mensagem, meta) => coletados.push({ mensagem, meta });
});

afterEach(() => {
    logger.info = infoOriginal;
});

function criarRes(statusCode) {
    const res = new EventEmitter();
    res.statusCode = statusCode;
    return res;
}

describe('registrarRequisicoes', () => {
    it('chama next e não registra nada antes da resposta terminar', () => {
        let seguiu = false;
        registrarRequisicoes({ method: 'GET', originalUrl: '/saude' }, criarRes(200), () => { seguiu = true; });
        expect(seguiu).toBe(true);
        expect(coletados).toHaveLength(0);
    });

    it('registra método, URL, status, duração e usuário ao terminar a resposta', () => {
        const res = criarRes(201);
        const req = { method: 'POST', originalUrl: '/api/tarefas', usuario: { id_usuario: 7 } };
        registrarRequisicoes(req, res, () => {});
        res.emit('finish');

        expect(coletados).toHaveLength(1);
        expect(coletados[0].mensagem).toBe('POST /api/tarefas 201');
        expect(coletados[0].meta.id_usuario).toBe(7);
        expect(typeof coletados[0].meta.duracao_ms).toBe('number');
    });

    it('registra requisição sem usuário autenticado', () => {
        const res = criarRes(401);
        registrarRequisicoes({ method: 'GET', originalUrl: '/api/culturas' }, res, () => {});
        res.emit('finish');
        expect(coletados[0].mensagem).toBe('GET /api/culturas 401');
        expect(coletados[0].meta.id_usuario).toBeUndefined();
    });
});
