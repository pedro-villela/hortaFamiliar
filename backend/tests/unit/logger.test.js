const logger = require('../../src/utils/logger');
const { criarLogger, redigir, nivelPadrao } = logger;

const DATA_FIXA = new Date('2030-05-10T12:00:00.000Z');

function criarComSaida(nivel) {
    const linhas = [];
    const instancia = criarLogger({
        nivel,
        saida: (n, linha) => linhas.push({ nivel: n, linha }),
        agora: () => DATA_FIXA
    });
    return { instancia, linhas };
}

describe('criarLogger', () => {
    it('escreve data ISO, nível e mensagem', () => {
        const { instancia, linhas } = criarComSaida('info');
        instancia.info('Servidor iniciado');
        expect(linhas).toHaveLength(1);
        expect(linhas[0].nivel).toBe('info');
        expect(linhas[0].linha).toBe('2030-05-10T12:00:00.000Z [INFO] Servidor iniciado');
    });

    it('anexa os dados extras em JSON', () => {
        const { instancia, linhas } = criarComSaida('info');
        instancia.info('Requisição', { status: 200 });
        expect(linhas[0].linha).toContain('{"status":200}');
    });

    it('respeita o nível configurado', () => {
        const { instancia, linhas } = criarComSaida('warn');
        instancia.debug('d');
        instancia.info('i');
        instancia.warn('w');
        instancia.error('e');
        expect(linhas.map((l) => l.nivel)).toEqual(['warn', 'error']);
    });

    it('nível debug registra tudo', () => {
        const { instancia, linhas } = criarComSaida('debug');
        instancia.debug('d');
        instancia.info('i');
        instancia.warn('w');
        instancia.error('e');
        expect(linhas).toHaveLength(4);
    });

    it('nível silent não registra nada', () => {
        const { instancia, linhas } = criarComSaida('silent');
        instancia.error('e');
        instancia.info('i');
        expect(linhas).toHaveLength(0);
    });

    it('nunca grava senha, token ou authorization em claro', () => {
        const { instancia, linhas } = criarComSaida('info');
        instancia.info('Login', { email: 'ana@horta.com', senha: 'Senha123', token: 'abc.def.ghi' });
        expect(linhas[0].linha).toContain('ana@horta.com');
        expect(linhas[0].linha).not.toContain('Senha123');
        expect(linhas[0].linha).not.toContain('abc.def.ghi');
        expect(linhas[0].linha).toContain('[OCULTO]');
    });

    it('registra Error com nome, mensagem e stack', () => {
        const { instancia, linhas } = criarComSaida('error');
        instancia.error('Falha', new Error('boom'));
        expect(linhas[0].linha).toContain('"mensagem":"boom"');
        expect(linhas[0].linha).toContain('"stack"');
    });
});

describe('redigir', () => {
    it('oculta campos sensíveis em objetos aninhados e listas', () => {
        const entrada = {
            usuario: { nome: 'Ana', senha: 'x' },
            cabecalhos: { Authorization: 'Bearer abc' },
            lista: [{ password: 'y', ok: 1 }]
        };
        const saida = redigir(entrada);
        expect(saida.usuario.nome).toBe('Ana');
        expect(saida.usuario.senha).toBe('[OCULTO]');
        expect(saida.cabecalhos.Authorization).toBe('[OCULTO]');
        expect(saida.lista[0].password).toBe('[OCULTO]');
        expect(saida.lista[0].ok).toBe(1);
    });

    it('não altera o objeto original', () => {
        const entrada = { senha: 'x' };
        redigir(entrada);
        expect(entrada.senha).toBe('x');
    });

    it('converte datas para texto ISO', () => {
        expect(redigir({ quando: DATA_FIXA }).quando).toBe('2030-05-10T12:00:00.000Z');
    });

    it('não entra em loop com referência circular', () => {
        const circular = { nome: 'a' };
        circular.si = circular;
        expect(() => JSON.stringify(redigir(circular))).not.toThrow();
    });
});

describe('nivelPadrao', () => {
    let nodeEnv;
    let logLevel;

    beforeEach(() => {
        nodeEnv = process.env.NODE_ENV;
        logLevel = process.env.LOG_LEVEL;
        delete process.env.LOG_LEVEL;
    });

    afterEach(() => {
        process.env.NODE_ENV = nodeEnv;
        if (logLevel === undefined) delete process.env.LOG_LEVEL;
        else process.env.LOG_LEVEL = logLevel;
    });

    it('é silent em ambiente de teste', () => {
        process.env.NODE_ENV = 'test';
        expect(nivelPadrao()).toBe('silent');
    });

    it('é info fora do ambiente de teste', () => {
        process.env.NODE_ENV = 'development';
        expect(nivelPadrao()).toBe('info');
    });

    it('usa LOG_LEVEL quando válido e ignora valor inválido', () => {
        process.env.NODE_ENV = 'development';
        process.env.LOG_LEVEL = 'DEBUG';
        expect(nivelPadrao()).toBe('debug');
        process.env.LOG_LEVEL = 'barulhento';
        expect(nivelPadrao()).toBe('info');
    });
});

describe('logger padrão', () => {
    it('expõe error, warn, info e debug', () => {
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.debug).toBe('function');
    });
});
