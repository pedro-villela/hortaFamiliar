
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState('MEMBRO');
  const [mensagem, setMensagem] = useState('');

  function cadastrar(evento) {
    evento.preventDefault();

    if (senha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      return;
    }

    setMensagem(
      'Formulário validado! O cadastro será integrado ao backend.'
    );
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
            Senha
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

          <label htmlFor="perfil">
            Perfil
          </label>
          <select
            id="perfil"
            value={perfil}
            onChange={(e) => setPerfil(e.target.value)}
          >
            <option value="MEMBRO">
              Membro
            </option>
            <option value="ADMIN">
              Administrador
            </option>
          </select>

          <button
            className="botao-entrar"
            type="submit"
          >
            CADASTRAR
          </button>

          {mensagem && (
            <p role="status">
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
