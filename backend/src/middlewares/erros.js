// Tratamento centralizado de erros.

const { ErroHttp } = require('../utils/validacao');

function naoEncontrado(req, res) {
    res.status(404).json({
        erro: 'Rota não encontrada.'
    });
}

function tratarErros(err, req, res, next) {
    console.error(err);

    if (err instanceof ErroHttp) {
        return res.status(err.status).json({
            erro: err.message
        });
    }

    // Erros conhecidos do PostgreSQL.
    if (err.code === '23505') {
        return res.status(409).json({
            erro: 'Registro duplicado.'
        });
    }

    if (err.code === '23503') {
        return res.status(409).json({
            erro: 'Não é possível realizar a operação porque o registro possui dados relacionados.'
        });
    }

    // Erro inesperado.
    res.status(500).json({
        erro: 'Erro interno do servidor.'
    });
}

module.exports = {
    naoEncontrado,
    tratarErros
};