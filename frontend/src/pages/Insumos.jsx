
import { useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import FormularioInsumo from '../components/FormularioInsumo';
import './Culturas.css';
import './Insumos.css';

const dadosIniciais = [
  {
    id: 1,
    nome: 'Semente de alface',
    categoria: 'Sementes',
    quantidade: 300,
    unidade: 'g',
    estoqueMinimo: 100
  },
  {
    id: 2,
    nome: 'Adubo orgânico',
    categoria: 'Fertilizantes',
    quantidade: 10,
    unidade: 'kg',
    estoqueMinimo: 5
  },
  {
    id: 3,
    nome: 'Fertilizante NPK',
    categoria: 'Fertilizantes',
    quantidade: 2,
    unidade: 'kg',
    estoqueMinimo: 3
  },
  {
    id: 4,
    nome: 'Enxada',
    categoria: 'Ferramentas',
    quantidade: 3,
    unidade: 'un',
    estoqueMinimo: 2
  }
];

const formularioVazio = {
  nome: '',
  categoria: 'Sementes',
  quantidade: '',
  unidade: 'un',
  estoqueMinimo: ''
};

function carregarInsumos() {
  try {
    const salvos = localStorage.getItem('horta_insumos');
    return salvos ? JSON.parse(salvos) : dadosIniciais;
  } catch {
    return dadosIniciais;
  }
}

function Insumos() {
  const [insumos, setInsumos] = useState(carregarInsumos);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);

  function atualizarInsumos(lista) {
    setInsumos(lista);
    localStorage.setItem('horta_insumos', JSON.stringify(lista));
  }

  function novoInsumo() {
    setIdEditando(null);
    setFormulario({ ...formularioVazio });
    setFormularioAberto(true);
  }

  function editar(insumo) {
    setIdEditando(insumo.id);

    setFormulario({
      nome: insumo.nome,
      categoria: insumo.categoria,
      quantidade: String(insumo.quantidade),
      unidade: insumo.unidade,
      estoqueMinimo: String(insumo.estoqueMinimo)
    });

    setFormularioAberto(true);
  }

  function salvar(evento) {
    evento.preventDefault();

    const nome = formulario.nome.trim();
    const quantidade = Number(formulario.quantidade);
    const estoqueMinimo = Number(formulario.estoqueMinimo);

    if (
      !nome ||
      formulario.quantidade === '' ||
      formulario.estoqueMinimo === '' ||
      !Number.isFinite(quantidade) ||
      !Number.isFinite(estoqueMinimo) ||
      quantidade < 0 ||
      estoqueMinimo < 0
    ) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    const duplicado = insumos.some(
      (insumo) =>
        insumo.nome.toLowerCase() === nome.toLowerCase() &&
        insumo.id !== idEditando
    );

    if (duplicado) {
      alert('Já existe um insumo com esse nome.');
      return;
    }

    const dados = {
      nome,
      categoria: formulario.categoria,
      quantidade,
      unidade: formulario.unidade,
      estoqueMinimo
    };

    if (idEditando !== null) {
      atualizarInsumos(
        insumos.map((insumo) =>
          insumo.id === idEditando
            ? { ...insumo, ...dados }
            : insumo
        )
      );
    } else {
      atualizarInsumos([
        ...insumos,
        { id: crypto.randomUUID(), ...dados }
      ]);
    }

    setFormularioAberto(false);
    setIdEditando(null);
  }

  function excluir(insumo) {
    const confirmou = window.confirm(
      `Deseja realmente excluir ${insumo.nome}?`
    );

    if (confirmou) {
      atualizarInsumos(
        insumos.filter((item) => item.id !== insumo.id)
      );
    }
  }

  const insumosFiltrados = insumos.filter((insumo) => {
    const correspondeBusca = insumo.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    const correspondeCategoria =
      categoriaFiltro === 'Todas' ||
      insumo.categoria === categoriaFiltro;

    return correspondeBusca && correspondeCategoria;
  });

  const totalEstoqueBaixo = insumos.filter(
    (insumo) => insumo.quantidade < insumo.estoqueMinimo
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
              <option value="Sementes">Sementes</option>
              <option value="Fertilizantes">Fertilizantes</option>
              <option value="Ferramentas">Ferramentas</option>
              <option value="Outros">Outros</option>
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
                    insumo.quantidade < insumo.estoqueMinimo;

                  return (
                    <tr key={insumo.id}>
                      <td>{insumo.nome}</td>
                      <td>{insumo.categoria}</td>
                      <td>
                        {insumo.quantidade} {insumo.unidade}
                      </td>
                      <td>
                        {insumo.estoqueMinimo} {insumo.unidade}
                      </td>
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
