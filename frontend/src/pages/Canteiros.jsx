import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import FormularioCanteiro from '../components/FormularioCanteiro';
import { requisicao } from '../services/api';
import './Culturas.css';
import './Canteiros.css';

const formularioVazio = {
  nome: '',
  area: '',
};

function Canteiros() {
  const [canteiros, setCanteiros] = useState([]);
  const [plantios, setPlantios] = useState([]);
  const [busca, setBusca] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);

  async function carregarCanteiros() {
    try {
      const [listaCanteiros, listaPlantios] = await Promise.all([
        requisicao('/api/canteiros'),
        requisicao('/api/plantios').catch(() => []),
      ]);
      setCanteiros(Array.isArray(listaCanteiros) ? listaCanteiros : []);
      setPlantios(Array.isArray(listaPlantios) ? listaPlantios : []);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarCanteiros();
  }, []);

  function novoCanteiro() {
    setIdEditando(null);
    setFormulario({ ...formularioVazio });
    setFormularioAberto(true);
  }

  function editar(canteiro) {
    setIdEditando(canteiro.id_canteiro);
    setFormulario({
      nome: canteiro.identificacao,
      area: String(canteiro.area_m2),
    });
    setFormularioAberto(true);
  }

  async function salvar(evento) {
    evento.preventDefault();

    const payload = {
      identificacao: formulario.nome.trim(),
      area_m2: Number(formulario.area),
    };

    try {
      if (idEditando !== null) {
        await requisicao(`/api/canteiros/${idEditando}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await requisicao('/api/canteiros', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      await carregarCanteiros();
      setFormularioAberto(false);
      setIdEditando(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function excluir(canteiro) {
    if (!window.confirm(`Excluir ${canteiro.identificacao}?`)) return;
    try {
      await requisicao(`/api/canteiros/${canteiro.id_canteiro}`, {
        method: 'DELETE',
      });
      await carregarCanteiros();
    } catch (err) {
      alert(err.message);
    }
  }

  const filtrados = canteiros.filter((canteiro) =>
    canteiro.identificacao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Canteiros</h1>
          <p>Gerencie os canteiros e acompanhe sua utilização.</p>

          <div className="culturas-acoes">
            <input
              type="search"
              placeholder="Buscar canteiro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <button className="botao-verde" onClick={novoCanteiro}>
              + NOVO CANTEIRO
            </button>
          </div>

          {formularioAberto && (
            <FormularioCanteiro
              formulario={formulario}
              setFormulario={setFormulario}
              salvar={salvar}
              cancelar={() => setFormularioAberto(false)}
              editando={idEditando !== null}
            />
          )}

          <div className="tabela-culturas-container">
            <table className="tabela-culturas">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Área</th>
                  <th>Cultura atual</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map((canteiro) => {
                  const plantioAtivo = plantios.find(
                    (p) =>
                      p.id_canteiro === canteiro.id_canteiro &&
                      p.status === 'CRESCIMENTO'
                  );
                  const statusCanteiro = plantioAtivo ? 'EM USO' : 'DISPONÍVEL';

                  return (
                    <tr key={canteiro.id_canteiro}>
                      <td>{canteiro.identificacao}</td>
                      <td>{canteiro.area_m2} m²</td>
                      <td>
                        {plantioAtivo
                          ? plantioAtivo.cultura || plantioAtivo.cultura_nome
                          : '-'}
                      </td>
                      <td>
                        <span
                          className={`status-canteiro ${
                            statusCanteiro === 'DISPONÍVEL' ? 'disponivel' : 'em-uso'
                          }`}
                        >
                          {statusCanteiro}
                        </span>
                      </td>
                      <td>
                        <button
                          className="acao-tabela"
                          onClick={() => editar(canteiro)}
                          aria-label={`Editar ${canteiro.identificacao}`}
                        >
                          ✏️
                        </button>

                        <button
                          className="acao-tabela"
                          onClick={() => excluir(canteiro)}
                          aria-label={`Excluir ${canteiro.identificacao}`}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtrados.length === 0 && (
              <p className="lista-vazia">Nenhum canteiro encontrado.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Canteiros;
