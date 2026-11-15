import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import { requisicao } from '../services/api';
import './Culturas.css';

function Culturas() {
  const [culturas, setCulturas] = useState([]);
  const [busca, setBusca] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [formulario, setFormulario] = useState({
    nome: '',
    maturacao: '',
    espacamento: '',
  });

  async function carregarCulturas() {
    try {
      const lista = await requisicao('/api/culturas');
      setCulturas(Array.isArray(lista) ? lista : []);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarCulturas();
  }, []);

  function abrirCadastro() {
    setIdEditando(null);
    setFormulario({ nome: '', maturacao: '', espacamento: '' });
    setFormularioAberto(true);
  }

  function editar(cultura) {
    setIdEditando(cultura.id_cultura);
    setFormulario({
      nome: cultura.nome,
      maturacao: String(cultura.tempo_maturacao_dias),
      espacamento: String(cultura.espacamento_ideal),
    });
    setFormularioAberto(true);
  }

  async function salvar(evento) {
    evento.preventDefault();
    const payload = {
      nome: formulario.nome.trim(),
      tempo_maturacao_dias: Number(formulario.maturacao),
      espacamento_ideal: Number(formulario.espacamento),
    };

    try {
      if (idEditando !== null) {
        await requisicao(`/api/culturas/${idEditando}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await requisicao('/api/culturas', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await carregarCulturas();
      setFormularioAberto(false);
      setIdEditando(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function excluir(cultura) {
    if (!window.confirm(`Deseja realmente excluir a cultura ${cultura.nome}?`)) return;
    try {
      await requisicao(`/api/culturas/${cultura.id_cultura}`, { method: 'DELETE' });
      await carregarCulturas();
    } catch (err) {
      alert(err.message);
    }
  }

  const culturasFiltradas = culturas.filter((cultura) =>
    cultura.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Culturas</h1>
          <p>Gerencie as culturas cadastradas na horta.</p>

          <div className="culturas-acoes">
            <input
              type="search"
              placeholder="Buscar cultura..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <button
              className="botao-verde"
              onClick={abrirCadastro}
            >
              + NOVA CULTURA
            </button>
          </div>

          {formularioAberto && (
            <form className="formulario-cultura" onSubmit={salvar}>
              <h2>
                {idEditando !== null
                  ? 'Editar cultura'
                  : 'Nova cultura'}
              </h2>

              <label htmlFor="nome-cultura">Nome da cultura</label>
              <input
                id="nome-cultura"
                value={formulario.nome}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    nome: e.target.value,
                  })
                }
                required
              />

              <label htmlFor="maturacao">Tempo de maturação (dias)</label>
              <input
                id="maturacao"
                type="number"
                min="1"
                value={formulario.maturacao}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    maturacao: e.target.value,
                  })
                }
                required
              />

              <label htmlFor="espacamento">Espaçamento ideal (m)</label>
              <input
                id="espacamento"
                type="number"
                min="0.01"
                step="0.01"
                value={formulario.espacamento}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    espacamento: e.target.value,
                  })
                }
                required
              />

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
                  <th>Maturação</th>
                  <th>Espaçamento</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {culturasFiltradas.map((cultura) => (
                  <tr key={cultura.id_cultura}>
                    <td>{cultura.nome}</td>
                    <td>{cultura.tempo_maturacao_dias} dias</td>
                    <td>{cultura.espacamento_ideal} m</td>
                    <td>
                      <span className="status-ativo">ATIVO</span>
                    </td>
                    <td>
                      <button
                        className="acao-tabela"
                        onClick={() => editar(cultura)}
                        aria-label={`Editar ${cultura.nome}`}
                      >
                        ✏️
                      </button>

                      <button
                        className="acao-tabela"
                        onClick={() => excluir(cultura)}
                        aria-label={`Excluir ${cultura.nome}`}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {culturasFiltradas.length === 0 && (
              <p className="lista-vazia">
                Nenhuma cultura encontrada.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Culturas;
