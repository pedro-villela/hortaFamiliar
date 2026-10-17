
const jwt = require('jsonwebtoken');

function gerarTokenSimulado(dados = {}) {
    const usuario = {
        id_usuario: dados.id_usuario ?? dados.id ?? 1,
        nome: dados.nome ?? 'Usuário de teste',
        email: dados.email ?? 'teste@exemplo.com',
        perfil: dados.perfil ?? 'OPERACIONAL'
    };

    return jwt.sign(
        usuario,
        process.env.JWT_SECRET || 'segredo-de-teste',
        { expiresIn: '1h' }
    );
}

module.exports = { gerarTokenSimulado };

