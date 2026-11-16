import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requisicao, salvarSessao } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [erro, setErro] = useState('');

  const navigate = useNavigate();

  async function entrar(evento) {
  evento.preventDefault();
  setErro('');
  try {
    const dados = await requisicao('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    salvarSessao(dados.token, dados.usuario);
    if (dados.usuario.perfil === 'ADMIN') {
      navigate('/dashboard');
    } else {
      navigate('/minhas-tarefas');
    }
  } catch (err) {
    setErro(err.message);
  }
}

  return (
    <div className="login-container">

      <section className="login-apresentacao">
        <h1>HORTA FAMILIAR</h1>

        <h2>Cultivando hoje um amanhã melhor.</h2>

        <p>
          Gestão simples para uma horta
          mais organizada e produtiva.
        </p>
      </section>

      <section className="login-formulario">
        <form className="formulario" onSubmit={entrar}>

          <h2>Bem-vindo(a)!</h2>
          <p>Acesse sua conta para continuar.</p>

          {erro && <p role="alert" style={{ color: '#b91c1c', fontWeight: 600 }}>{erro}</p>}

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />

          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />

          <button
            className="botao-entrar"
            type="submit"
          >
            ENTRAR
          </button>

          <p className="cadastro">
            Não possui uma conta?{' '}

            <button
              type="button"
              className="link-texto"
              onClick={() => navigate('/cadastro')}
            >
              Cadastre-se
            </button>
          </p>

        </form>
      </section>

    </div>
  );
}

export default Login;
