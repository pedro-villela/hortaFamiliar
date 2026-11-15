import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requisicao, salvarSessao } from '../services/api';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  async function cadastrar(evento) {
    evento.preventDefault();
    setMensagem('');

    if (senha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      return;
    }

    try {
      const dados = await requisicao('/api/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      });

      if (dados?.token && dados?.usuario) {
        salvarSessao(dados.token, dados.usuario);
        navigate('/minhas-tarefas');
      } else {
        const login = await requisicao('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, senha }),
        });
        salvarSessao(login.token, login.usuario);
        navigate('/minhas-tarefas');
      }
    } catch (err) {
      setMensagem(err.message);
    }
  }

  return (
    <div className="login-container">

      <section className="login-apresentacao">
        <h1>HORTA FAMILIAR</h1>
        <h2>Cultivando hoje um amanhã melhor.</h2>
        <p>
          Gestão simples para uma horta mais organizada e produtiva.
        </p>
      </section>

      <section className="login-formulario">
        <form className="formulario" onSubmit={cadastrar}>

          <h2>Criar conta</h2>
          <p>Preencha seus dados para se cadastrar.</p>

          <label htmlFor="nome">
            Nome completo
          </label>
          <input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <label htmlFor="email-cadastro">
            E-mail
          </label>
          <input
            id="email-cadastro"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="senha-cadastro">
            Senha (mínimo 8 caracteres, letras e números)
          </label>
          <input
            id="senha-cadastro"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <label htmlFor="confirmar-senha">
            Confirmar senha
          </label>
          <input
            id="confirmar-senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) =>
              setConfirmarSenha(e.target.value)
            }
            required
          />

          <button
            className="botao-entrar"
            type="submit"
          >
            CADASTRAR
          </button>

          {mensagem && (
            <p role="status" style={{ color: '#b91c1c', fontWeight: 600 }}>
              {mensagem}
            </p>
          )}

          <p className="cadastro">
            Já possui uma conta?{' '}
            <Link
              to="/login"
              className="link-texto"
            >
              Entrar
            </Link>
          </p>

        </form>
      </section>

    </div>
  );
}

export default Cadastro;
