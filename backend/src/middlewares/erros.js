// Tratamento centralizado de erros.

const { ErroHttp } = require('../utils/validacao');

function naoEncontrado(req, res) {
    res.status(404).json({ erro: 'Rota não encontrada.' });
}

function tratarErros(err, req, res, next) {
    console.error(err);

    if (err instanceof ErroHttp) {
        return res.status(err.status).json({ erro: err.message});
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
    }

    // Erros conhecidos do PostgreSQL.
    switch (err.code) {
        case '23505': return res.status(409).json({ erro: 'Já existe um registro com este valor único.', detalhe: err.detail });
        case '23503': return res.status(409).json({ erro: 'Operação inválida: referência a um registro inexistente ou ainda em uso.', detalhe: err.detail });
        case '23514': return res.status(400).json({ erro: 'Valor rejeitado por uma regra de integridade do banco.', detalhe: err.constraint });
        case '23P01': return res.status(409).json({ erro: 'Conflito de agendamento: o canteiro já está ocupado neste horário.' });
        case '22P02': return res.status(400).json({ erro: 'Valor em formato inválido.' });
    }

    // Erro inesperado.
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });

}

module.exports = { naoEncontrado, tratarErros };