const {
    ErroHttp,
    texto,
    numeroPositivo,
    numeroNaoNegativo,
    inteiroPositivo,
    opcao,
    data,
    hora,
    idDaRota,
    validarEmail,
    validarSenha
} = require('../../src/utils/validacao');

// Executa a função e devolve o erro lançado (ou undefined se não lançou).
function erroDe(funcao) {
    try {
        funcao();
    } catch (erro) {
        return erro;
    }
    return undefined;
}

function esperaErro400(funcao, trecho) {
    const erro = erroDe(funcao);
    expect(erro).toBeInstanceOf(ErroHttp);
    expect(erro.status).toBe(400);
    if (trecho) {
        expect(erro.message).toContain(trecho);
    }
}

describe('ErroHttp', () => {
    it('guarda status e mensagem e é um Error', () => {
        const erro = new ErroHttp(404, 'Não encontrado.');
        expect(erro).toBeInstanceOf(Error);
        expect(erro.status).toBe(404);
        expect(erro.message).toBe('Não encontrado.');
    });
});

describe('texto', () => {
    it('devolve o valor sem espaços nas pontas', () => {
        expect(texto('  Alface  ', 'nome')).toBe('Alface');
    });

    it('rejeita texto vazio ou só com espaços', () => {
        esperaErro400(() => texto('', 'nome'), 'é obrigatório');
        esperaErro400(() => texto('   ', 'nome'), 'é obrigatório');
    });

    it('rejeita valor que não é string', () => {
        esperaErro400(() => texto(123, 'nome'));
        esperaErro400(() => texto(undefined, 'nome'));
        esperaErro400(() => texto(null, 'nome'));
    });

    it('rejeita texto maior que o máximo', () => {
        esperaErro400(() => texto('abcdef', 'nome', 5), 'no maximo 5');
        expect(texto('abcde', 'nome', 5)).toBe('abcde');
    });
});

describe('numeroPositivo', () => {
    it('aceita número e string numérica maiores que zero', () => {
        expect(numeroPositivo(2.5, 'area')).toBe(2.5);
        expect(numeroPositivo('3', 'area')).toBe(3);
    });

    it('rejeita zero, negativo, vazio e não numérico', () => {
        esperaErro400(() => numeroPositivo(0, 'area'), 'maior que 0');
        esperaErro400(() => numeroPositivo(-1, 'area'));
        esperaErro400(() => numeroPositivo('', 'area'));
        esperaErro400(() => numeroPositivo(undefined, 'area'));
        esperaErro400(() => numeroPositivo('abc', 'area'));
    });
});

describe('numeroNaoNegativo', () => {
    it('aceita zero e positivos', () => {
        expect(numeroNaoNegativo(0, 'estoque')).toBe(0);
        expect(numeroNaoNegativo('10.5', 'estoque')).toBe(10.5);
    });

    it('CT04 - rejeita quantidade de estoque negativa', () => {
        esperaErro400(() => numeroNaoNegativo(-1, 'quantidade_estoque'), 'não pode ser negativo');
    });

    it('rejeita ausente, vazio e não numérico', () => {
        esperaErro400(() => numeroNaoNegativo(undefined, 'estoque'));
        esperaErro400(() => numeroNaoNegativo('', 'estoque'));
        esperaErro400(() => numeroNaoNegativo('abc', 'estoque'));
        esperaErro400(() => numeroNaoNegativo(NaN, 'estoque'));
    });
});

describe('inteiroPositivo', () => {
    it('CT03 - aceita tempo de maturação inteiro e positivo', () => {
        expect(inteiroPositivo(60, 'tempo_maturacao_dias')).toBe(60);
        expect(inteiroPositivo('45', 'tempo_maturacao_dias')).toBe(45);
    });

    it('CT03 - rejeita tempo de maturação zero, negativo ou decimal', () => {
        esperaErro400(() => inteiroPositivo(0, 'tempo_maturacao_dias'), 'inteiro maior que 0');
        esperaErro400(() => inteiroPositivo(-5, 'tempo_maturacao_dias'));
        esperaErro400(() => inteiroPositivo(1.5, 'tempo_maturacao_dias'));
    });
});

describe('opcao', () => {
    it('aceita valor da lista', () => {
        expect(opcao('ADMIN', 'perfil', ['ADMIN', 'OPERACIONAL'])).toBe('ADMIN');
    });

    it('rejeita valor fora da lista informando as opções', () => {
        esperaErro400(() => opcao('FANTASMA', 'perfil', ['ADMIN', 'OPERACIONAL']), 'ADMIN, OPERACIONAL');
    });
});

describe('data', () => {
    it('aceita data válida, inclusive 29/02 em ano bissexto', () => {
        expect(data('2030-05-10', 'data_tarefa')).toBe('2030-05-10');
        expect(data('2028-02-29', 'data_tarefa')).toBe('2028-02-29');
    });

    it('rejeita formato diferente de AAAA-MM-DD', () => {
        esperaErro400(() => data('10/05/2030', 'data_tarefa'), 'AAAA-MM-DD');
        esperaErro400(() => data('data-invalida', 'data_tarefa'));
        esperaErro400(() => data(20300510, 'data_tarefa'));
        esperaErro400(() => data(undefined, 'data_tarefa'));
    });

    it('rejeita data que não existe no calendário', () => {
        esperaErro400(() => data('2030-02-31', 'data_tarefa'));
        esperaErro400(() => data('2030-02-29', 'data_tarefa'));
        esperaErro400(() => data('2030-13-01', 'data_tarefa'));
    });
});

describe('hora', () => {
    it('aceita HH:MM e HH:MM:SS', () => {
        expect(hora('09:30', 'hora_inicio')).toBe('09:30');
        expect(hora('23:59:59', 'hora_inicio')).toBe('23:59:59');
    });

    it('rejeita horas fora do intervalo ou fora do formato', () => {
        esperaErro400(() => hora('24:00', 'hora_inicio'), 'HH:MM');
        esperaErro400(() => hora('10:60', 'hora_inicio'));
        esperaErro400(() => hora('9:30', 'hora_inicio'));
        esperaErro400(() => hora(930, 'hora_inicio'));
    });
});

describe('idDaRota', () => {
    it('lê o id inteiro da URL', () => {
        expect(idDaRota({ params: { id: '5' } })).toBe(5);
    });

    it('rejeita id inválido', () => {
        esperaErro400(() => idDaRota({ params: { id: 'abc' } }), 'id');
        esperaErro400(() => idDaRota({ params: { id: '0' } }));
        esperaErro400(() => idDaRota({ params: { id: '1.5' } }));
    });
});

describe('validarEmail', () => {
    it('normaliza para minúsculas e remove espaços', () => {
        expect(validarEmail('  Maria@Horta.COM ')).toBe('maria@horta.com');
    });

    it('rejeita e-mail sem arroba, sem domínio ou vazio', () => {
        esperaErro400(() => validarEmail('mariahorta.com'), 'E-mail inválido');
        esperaErro400(() => validarEmail('maria@horta'), 'E-mail inválido');
        esperaErro400(() => validarEmail(''), 'é obrigatório');
    });

    it('rejeita e-mail com mais de 150 caracteres', () => {
        esperaErro400(() => validarEmail(`${'a'.repeat(150)}@horta.com`), 'no maximo 150');
    });
});

describe('validarSenha', () => {
    it('aceita senha com 8+ caracteres, letras e números', () => {
        expect(validarSenha('Senha123')).toBe('Senha123');
    });

    it('rejeita senha curta, só letras, só números ou não string', () => {
        const trecho = 'no mínimo 8 caracteres';
        esperaErro400(() => validarSenha('Abc12'), trecho);
        esperaErro400(() => validarSenha('somenteletras'), trecho);
        esperaErro400(() => validarSenha('12345678'), trecho);
        esperaErro400(() => validarSenha(undefined), trecho);
    });
});
