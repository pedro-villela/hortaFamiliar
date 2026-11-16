import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import FormularioInsumo from '../components/FormularioInsumo';
import { requisicao } from '../services/api';
import './Culturas.css';
import './Insumos.css';

const formularioVazio = {
  nome: '',
  categoria: 'SEMENTE',
  quantidade: '',
  estoqueMinimo: ''
};

function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);

  async function carregarInsumos() {
    try {
      const lista = await requisicao('/api/insumos');
      setInsumos(Array.isArray(lista) ? lista : []);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarInsumos();
  }, []);

  function novoInsumo() {
    setIdEditando(null);
    setFormulario({ ...formularioVazio });
    setFormularioAberto(true);
  }

  function editar(insumo) {
    setIdEditando(insumo.id_insumo);

    setFormulario({
      nome: insumo.nome,
      categoria: insumo.tipo,
      quantidade: String(insumo.quantidade_estoque),
      estoqueMinimo: String(insumo.estoque_minimo)
    });

    setFormularioAberto(true);
  }

  async function salvar(evento) {
    evento.preventDefault();

    const payload = {
      nome: formulario.nome.trim(),
      tipo: formulario.categoria,
      quantidade_estoque: Number(formulario.quantidade),
      estoque_minimo: Number(formulario.estoqueMinimo)
    };

    try {
      if (idEditando !== null) {
        await requisicao(`/api/insumos/${idEditando}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await requisicao('/api/insumos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      await carregarInsumos();
      setFormularioAberto(false);
      setIdEditando(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function excluir(insumo) {
    const confirmou = window.confirm(
      `Deseja realmente excluir ${insumo.nome}?`
    );

    if (!confirmou) return;

    try {
      await requisicao(`/api/insumos/${insumo.id_insumo}`, {
        method: 'DELETE'
      });
      await carregarInsumos();
    } catch (err) {
      alert(err.message);
    }
  }

  const insumosFiltrados = insumos.filter((insumo) => {
    const correspondeBusca = insumo.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    const correspondeCategoria =
      categoriaFiltro === 'Todas' ||
      insumo.tipo === categoriaFiltro;

    return correspondeBusca && correspondeCategoria;
  });

  const totalEstoqueBaixo = insumos.filter(
    (insumo) =>
      insumo.abaixo_do_minimo ||
      Number(insumo.quantidade_estoque) <= Number(insumo.estoque_minimo)
  ).length;

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Controle de Insumos</h1>
          <p>
            Gerencie os insumos e acompanhe a disponibilidade
            do estoque da horta.
          </p>

          <div className="resumo-insumos">
            <div className="resumo-insumo-card">
              <span>Total de insumos</span>
              <strong>{insumos.length}</strong>
            </div>

            <div className="resumo-insumo-card">
              <span>Estoque abaixo do mínimo</span>
              <strong>{totalEstoqueBaixo}</strong>
            </div>
          </div>

          <div className="insumos-acoes">
            <input
              type="search"
              placeholder="Buscar insumo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              aria-label="Filtrar por categoria"
            >
              <option value="Todas">Todas as categorias</option>
              <option value="SEMENTE">Sementes</option>
              <option value="FERTILIZANTE">Fertilizantes</option>
              <option value="FERRAMENTA">Ferramentas</option>
            </select>

            <button className="botao-verde" onClick={novoInsumo}>
              + NOVO INSUMO
            </button>
          </div>

          {formularioAberto && (
            <FormularioInsumo
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
                  <th>Insumo</th>
                  <th>Categoria</th>
                  <th>Quantidade</th>
                  <th>Estoque mínimo</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {insumosFiltrados.map((insumo) => {
                  const estoqueBaixo =
                    insumo.abaixo_do_minimo ||
                    Number(insumo.quantidade_estoque) <=
                      Number(insumo.estoque_minimo);

                  return (
                    <tr key={insumo.id_insumo}>
                      <td>{insumo.nome}</td>
                      <td>{insumo.tipo}</td>
                      <td>{insumo.quantidade_estoque}</td>
                      <td>{insumo.estoque_minimo}</td>
                      <td>
                        <span
                          className={
                            estoqueBaixo
                              ? 'situacao-insumo baixo'
                              : 'situacao-insumo normal'
                          }
                        >
                          {estoqueBaixo
                            ? 'ESTOQUE BAIXO'
                            : 'NORMAL'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="acao-tabela"
                          onClick={() => editar(insumo)}
                          aria-label={`Editar ${insumo.nome}`}
                        >
                          ✏️
                        </button>

                        <button
                          className="acao-tabela"
                          onClick={() => excluir(insumo)}
                          aria-label={`Excluir ${insumo.nome}`}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {insumosFiltrados.length === 0 && (
              <p className="lista-vazia">
                Nenhum insumo encontrado.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Insumos;
