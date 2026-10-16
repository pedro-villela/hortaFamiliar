// Autenticação e autorização por perfil.

const jwt = require('jsonwebtoken');
const { ErroHttp } = require('../utils/validacao');

function segredo() {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não definido');
    return process.env.JWT_SECRET;
}

// ============================================================
// GERAÇÃO DO TOKEN
// ============================================================

function gerarToken(usuario) {
    const payload = {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
    };

    return jwt.sign(
        payload, 
        segredo(),
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================

function autenticar(req, res, next) {
    try {
        const cabecalho = req.headers.authorization || '';

        if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
            throw new ErroHttp(401, 'Token de autenticação não informado.');
        }

        const token = cabecalho.substring(7);
        const usuario = jwt.verify( token, segredo());

        // Disponibiliza os dados do usuário
        // para as próximas rotas.
        req.usuario = usuario;
        next();

    } catch (erro) {
        if (erro instanceof ErroHttp) {return next(erro); }
        if (erro.name === 'TokenExpiredError') { return next( new ErroHttp( 401, 'Token de autenticação expirado.' ));}
        if (erro.name === 'JsonWebTokenError') { return next( new ErroHttp( 401, 'Token de autenticação inválido.' ));}
        next(erro);
    }
}

// ============================================================
// AUTORIZAÇÃO POR PERFIL
// ============================================================
function autorizar(...perfisPermitidos) {
    return (req, res, next) => {
        if (!req.usuario) { 
            return next(new ErroHttp(401, 'Usuário não autenticado.' )); 
        }

        if (!perfisPermitidos.includes(req.usuario.perfil)) {
            return next(new ErroHttp(403,'Usuário não possui permissão para esta operação.'));
        }
        next();
    };
}

module.exports = { gerarToken, autenticar, autorizar};

