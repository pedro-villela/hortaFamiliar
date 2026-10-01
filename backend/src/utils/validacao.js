// Funções de validação reutilizadas pelas rotas.
class ErroHttp extends Error {
    constructor(status, mensagem) {
        super(mensagem);
        this.status = status;
    }
}

function texto(valor, campo, max) {
    if (typeof valor !== 'string' || valor.trim() === '') {
        throw new ErroHttp(400, `O "${campo}" é obrigatório`);
    }
    if (max && valor.trim().length > max) {
        throw new ErroHttp(400, `O "${campo}" deve ter no maximo ${max} caracteres.`);
    }
    return valor.trim();
}

function numeroPositivo(valor, campo) {
    const n = Number(valor);
    if (valor === undefined || valor === null || valor === '' || !Number.isFinite(n) || n <= 0) {
        throw new ErroHttp(400, `O "${campo}" tem que ser maior que 0`);
    }
    return n;
}

function numeroNaoNegativo(valor, campo) {
    const n = Number(valor);
    if (valor === undefined || valor === null || valor === '' || !Number.isFinite(n) || n < 0) {
        throw new ErroHttp(400, `O "${campo}" não pode ser negativo`);
    }
    return n;
}

function inteiroPositivo(valor, campo) {
    const n = Number(valor);
    if (valor === undefined || valor === null || valor === '' || !Number.isInteger(n) || n <= 0) {
        throw new ErroHttp(400, `O "${campo}" tem que ser inteiro maior que 0`);
    }
    return n;
}

function opcao(valor, campo, permitidos) {
    if (!permitidos.includes(valor)) {
        throw new ErroHttp(400, `O "${campo}" deve ser um de: ${permitidos.join(', ')}.`);
    }
    return valor;
}

function data(valor, campo) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor))) {
        throw new ErroHttp(400, `O "${campo}" deve estar no formato AAAA-MM-DD`);
    }
    return valor;
}

function hora(valor, campo) {
    if (typeof valor !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(valor)) {
        throw new ErroHttp(400, `O "${campo}" deve estar no formato HH:MM`);
    }
    return valor;
}

// Lê o :id da URL e garante que é um inteiro válido.
function idDaRota(req) {
    return inteiroPositivo(req.params.id, 'id');
}

module.exports = { ErroHttp, texto, numeroPositivo, numeroNaoNegativo, inteiroPositivo, opcao, data, hora, idDaRota };
