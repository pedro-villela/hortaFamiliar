const jwt = require('jsonwebtoken');
const { gerarToken, autenticar, autorizar } = require('../../src/middlewares/auth');
const { ErroHttp } = require('../../src/utils/validacao');

const SEGREDO = 'segredo-de-teste';

const ADMIN = { id_usuario: 1, nome: 'Ana', email: 'ana@horta.com', perfil: 'ADMIN' };
const OPERACIONAL = { id_usuario: 2, nome: 'Beto', email: 'beto@horta.com', perfil: 'OPERACIONAL' };

let segredoOriginal;
let expiracaoOriginal;

beforeEach(() => {
    segredoOriginal = process.env.JWT_SECRET;
    expiracaoOriginal = process.env.JWT_EXPIRES_IN;
    process.env.JWT_SECRET = SEGREDO;
    delete process.env.JWT_EXPIRES_IN;
});

afterEach(() => {
    if (segredoOriginal === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = segredoOriginal;

    if (expiracaoOriginal === undefined) delete process.env.JWT_EXPIRES_IN;
    else process.env.JWT_EXPIRES_IN = expiracaoOriginal;
});

// Executa o middleware e devolve { req, erro, seguiu }.
function executar(middleware, req) {
    const resultado = { req, erro: undefined, seguiu: false };
    middleware(req, {}, (erro) => {
        resultado.seguiu = true;
        resultado.erro = erro;
    });
    return resultado;
}

describe('gerarToken', () => {
    it('gera um token válido com os dados do usuário', () => {
        const token = gerarToken(ADMIN);
        const dados = jwt.verify(token, SEGREDO);
        expect(dados.id_usuario).toBe(1);
        expect(dados.email).toBe('ana@horta.com');
        expect(dados.perfil).toBe('ADMIN');
    });

    it('não grava a senha no token', () => {
        const token = gerarToken({ ...ADMIN, senha: 'hash-secreto' });
        const dados = jwt.verify(token, SEGREDO);
        expect(dados.senha).toBeUndefined();
    });

    it('usa JWT_EXPIRES_IN quando definido', () => {
        process.env.JWT_EXPIRES_IN = '1h';
        const dados = jwt.verify(gerarToken(ADMIN), SEGREDO);
        expect(dados.exp - dados.iat).toBe(3600);
    });

    it('usa 8 horas quando JWT_EXPIRES_IN não está definido', () => {
        const dados = jwt.verify(gerarToken(ADMIN), SEGREDO);
        expect(dados.exp - dados.iat).toBe(8 * 3600);
    });

    it('lança erro 500 quando JWT_SECRET não está configurado', () => {
        delete process.env.JWT_SECRET;
        let erro;
        try {
            gerarToken(ADMIN);
        } catch (e) {
            erro = e;
        }
        expect(erro).toBeInstanceOf(ErroHttp);
        expect(erro.status).toBe(500);
    });
});

describe('autenticar', () => {
    it('CT01 - aceita token válido e disponibiliza o usuário em req.usuario', () => {
        const token = gerarToken(OPERACIONAL);
        const { req, erro, seguiu } = executar(autenticar, { headers: { authorization: `Bearer ${token}` } });
        expect(seguiu).toBe(true);
        expect(erro).toBeUndefined();
        expect(req.usuario.id_usuario).toBe(2);
        expect(req.usuario.perfil).toBe('OPERACIONAL');
    });

    it('rejeita requisição sem cabeçalho Authorization (401)', () => {
        const { erro } = executar(autenticar, { headers: {} });
        expect(erro).toBeInstanceOf(ErroHttp);
        expect(erro.status).toBe(401);
        expect(erro.message).toContain('não informado');
    });

    it('rejeita cabeçalho que não começa com "Bearer " (401)', () => {
        const token = gerarToken(ADMIN);
        const { erro } = executar(autenticar, { headers: { authorization: token } });
        expect(erro.status).toBe(401);
    });

    it('rejeita token malformado (401)', () => {
        const { erro } = executar(autenticar, { headers: { authorization: 'Bearer abc' } });
        expect(erro.status).toBe(401);
        expect(erro.message).toContain('inválido');
    });

    it('rejeita token expirado (401)', () => {
        const expirado = jwt.sign({ ...ADMIN, exp: Math.floor(Date.now() / 1000) - 60 }, SEGREDO);
        const { erro } = executar(autenticar, { headers: { authorization: `Bearer ${expirado}` } });
        expect(erro.status).toBe(401);
        expect(erro.message).toContain('expirado');
    });

    it('rejeita token assinado com outro segredo (401)', () => {
        const falso = jwt.sign(ADMIN, 'outro-segredo');
        const { erro } = executar(autenticar, { headers: { authorization: `Bearer ${falso}` } });
        expect(erro.status).toBe(401);
        expect(erro.message).toContain('inválido');
    });

    it('devolve erro 500 quando JWT_SECRET não está configurado', () => {
        delete process.env.JWT_SECRET;
        const { erro } = executar(autenticar, { headers: { authorization: 'Bearer qualquer' } });
        expect(erro).toBeInstanceOf(ErroHttp);
        expect(erro.status).toBe(500);
    });
});

describe('autorizar', () => {
    it('CT02 - bloqueia OPERACIONAL em rota exclusiva do ADMIN (403)', () => {
        const { erro, seguiu } = executar(autorizar('ADMIN'), { usuario: OPERACIONAL });
        expect(seguiu).toBe(true);
        expect(erro).toBeInstanceOf(ErroHttp);
        expect(erro.status).toBe(403);
        expect(erro.message).toContain('não possui permissão');
    });

    it('permite ADMIN em rota exclusiva do ADMIN', () => {
        const { erro, seguiu } = executar(autorizar('ADMIN'), { usuario: ADMIN });
        expect(seguiu).toBe(true);
        expect(erro).toBeUndefined();
    });

    it('aceita mais de um perfil permitido', () => {
        const middleware = autorizar('ADMIN', 'OPERACIONAL');
        expect(executar(middleware, { usuario: OPERACIONAL }).erro).toBeUndefined();
        expect(executar(middleware, { usuario: ADMIN }).erro).toBeUndefined();
    });

    it('bloqueia perfil desconhecido (403)', () => {
        const { erro } = executar(autorizar('ADMIN', 'OPERACIONAL'), { usuario: { id_usuario: 9, perfil: 'FANTASMA' } });
        expect(erro.status).toBe(403);
    });

    it('devolve 401 quando não há usuário autenticado', () => {
        const { erro } = executar(autorizar('ADMIN'), {});
        expect(erro).toBeInstanceOf(ErroHttp);
        expect(erro.status).toBe(401);
    });
});
