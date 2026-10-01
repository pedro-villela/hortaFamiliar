// Tratamento centralizado de erros.
const { ErroHttp } = require('../utils/validacao');

function naoEncontrado(req, res) {
    res.status(404).json({ erro: 'Rota não encontrada.' });
}

function tratarErros(err, req, res, next) {

}