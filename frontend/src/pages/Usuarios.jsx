import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import { requisicao, obterUsuarioLogado } from '../services/api';
import './Culturas.css';

const formularioVazio = {
  nome: '',
  email: '',
  senha: '',
  perfil: 'OPERACIONAL'
};

function Usuarios() {
  const usuarioLogado = obterUsuarioLogado();
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);

  async function carregarUsuarios() {
    try {
      const lista = await requisicao('/api/usuarios');
      setUsuarios(Array.isArray(lista) ? lista : []);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function abrirCadastro() {
    setIdEditando(null);
    setFormulario({ ...formularioVazio });
    setFormularioAberto(true);
  }

  function editar(usuario) {
    setIdEditando(usuario.id_usuario);
    setFormulario({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      perfil: usuario.perfil
    });
    setFormularioAberto(true);
  }

  async function salvar(evento) {
    evento.preventDefault();

    try {
      if (idEditando !== null) {
        await requisicao(`/api/usuarios/${idEditando}`, {
          method: 'PUT',
          body: JSON.stringify({
            nome: formulario.nome.trim(),
            email: formulario.email.trim(),
            perfil: formulario.perfil
          })
        });
      } else {
        await requisicao('/api/usuarios', {
          method: 'POST',
          body: JSON.stringify({
            nome: formulario.nome.trim(),
            email: formulario.email.trim(),
            senha: formulario.senha,
            perfil: formulario.perfil
          })
        });
      }

      await carregarUsuarios();
      setFormularioAberto(false);
      setIdEditando(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function excluir(usuario) {
    if (
      !window.confirm(`Deseja realmente excluir o usuário ${usuario.nome}?`)
    ) {
      return;
    }

    try {
      await requisicao(`/api/usuarios/${usuario.id_usuario}`, {
        method: 'DELETE'
      });
      await carregarUsuarios();
    } catch (err) {
      alert(err.message);
    }
  }

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Usuários e Membros</h1>
          <p>
            Gerencie as contas e os perfis de acesso (Administrador e Membro Operacional).
          </p>

          <div className="culturas-acoes">
            <input
              type="search"
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <button className="botao-verde" onClick={abrirCadastro}>
              + NOVO USUÁRIO
            </button>
          </div>

          {formularioAberto && (
            <form className="formulario-cultura" onSubmit={salvar}>
              <h2>
                {idEditando !== null ? 'Editar usuário' : 'Novo usuário'}
              </h2>

              <label htmlFor="nome-usuario">Nome completo</label>
              <input
                id="nome-usuario"
                value={formulario.nome}
                onChange={(e) =>
                  setFormulario({ ...formulario, nome: e.target.value })
                }
                required
              />

              <label htmlFor="email-usuario">E-mail</label>
              <input
                id="email-usuario"
                type="email"
                value={formulario.email}
                onChange={(e) =>
                  setFormulario({ ...formulario, email: e.target.value })
                }
                required
              />

              {idEditando === null && (
                <>
                  <label htmlFor="senha-usuario">
                    Senha (mínimo 8 caracteres, letras e números)
                  </label>
                  <input
                    id="senha-usuario"
                    type="password"
                    value={formulario.senha}
                    onChange={(e) =>
                      setFormulario({ ...formulario, senha: e.target.value })
                    }
                    required
                  />
                </>
              )}

              <label htmlFor="perfil-usuario">Perfil de acesso</label>
              <select
                id="perfil-usuario"
                value={formulario.perfil}
                onChange={(e) =>
                  setFormulario({ ...formulario, perfil: e.target.value })
                }
              >
                <option value="OPERACIONAL">Membro (OPERACIONAL)</option>
                <option value="ADMIN">Administrador (ADMIN)</option>
              </select>

              <div className="formulario-botoes">
                <button
                  type="button"
                  className="botao-cancelar"
                  onClick={() => setFormularioAberto(false)}
                >
                  CANCELAR
                </button>

                <button type="submit" className="botao-verde">
                  SALVAR
                </button>
              </div>
            </form>
          )}

          <div className="tabela-culturas-container">
            <table className="tabela-culturas">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className="status-ativo">{usuario.perfil}</span>
                    </td>
                    <td>
                      <button
                        className="acao-tabela"
                        onClick={() => editar(usuario)}
                        aria-label={`Editar ${usuario.nome}`}
                      >
                        ✏️
                      </button>

                      {usuarioLogado?.id_usuario !== usuario.id_usuario && (
                        <button
                          className="acao-tabela"
                          onClick={() => excluir(usuario)}
                          aria-label={`Excluir ${usuario.nome}`}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {usuariosFiltrados.length === 0 && (
              <p className="lista-vazia">Nenhum usuário encontrado.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Usuarios;
