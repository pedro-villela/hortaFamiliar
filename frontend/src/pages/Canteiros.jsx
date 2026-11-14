
import { useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import FormularioCanteiro from '../components/FormularioCanteiro';
import './Culturas.css';
import './Canteiros.css';

const dadosIniciais = [
  { id: 1, nome: 'Canteiro A', area: 10, cultura: 'Alface', status: 'EM USO', localizacao: 'Setor norte', descricao: '' },
  { id: 2, nome: 'Canteiro B', area: 12, cultura: '-', status: 'DISPONÍVEL', localizacao: 'Setor sul', descricao: '' },
  { id: 3, nome: 'Canteiro C', area: 8, cultura: 'Tomate', status: 'EM USO', localizacao: 'Setor leste', descricao: '' },
  { id: 4, nome: 'Canteiro D', area: 15, cultura: '-', status: 'EM PREPARO', localizacao: 'Setor oeste', descricao: '' },
  { id: 5, nome: 'Canteiro E', area: 9, cultura: 'Couve', status: 'EM USO', localizacao: 'Setor central', descricao: '' },
];

const formularioVazio = {
  nome: '',
  area: '',
  status: 'DISPONÍVEL',
  localizacao: '',
  descricao: '',
};

function carregarCanteiros() {
  try {
    const salvos = localStorage.getItem('horta_canteiros');
    return salvos ? JSON.parse(salvos) : dadosIniciais;
  } catch {
    return dadosIniciais;
  }
}

function Canteiros() {
  const [canteiros, setCanteiros] = useState(carregarCanteiros);
  const [busca, setBusca] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);

  function atualizarCanteiros(lista) {
    setCanteiros(lista);
    localStorage.setItem('horta_canteiros', JSON.stringify(lista));
  }

  function novoCanteiro() {
    setIdEditando(null);
    setFormulario({ ...formularioVazio });
    setFormularioAberto(true);
  }

  function editar(canteiro) {
    setIdEditando(canteiro.id);
    setFormulario({
      nome: canteiro.nome,
      area: String(canteiro.area),
      status: canteiro.status,
      localizacao: canteiro.localizacao,
      descricao: canteiro.descricao,
    });
    setFormularioAberto(true);
  }

  function salvar(evento) {
    evento.preventDefault();

    const nome = formulario.nome.trim();
    const area = Number(formulario.area);

    if (!nome || !Number.isFinite(area) || area <= 0 || !formulario.localizacao.trim()) {
      alert('Preencha os campos obrigatórios corretamente.');
      return;
    }

    const duplicado = canteiros.some(
      (canteiro) =>
        canteiro.nome.toLowerCase() === nome.toLowerCase() &&
        canteiro.id !== idEditando
    );

    if (duplicado) {
      alert('Já existe um canteiro com esse nome.');
      return;
    }

    const dados = {
      nome,
      area,
      status: formulario.status,
      localizacao: formulario.localizacao.trim(),
      descricao: formulario.descricao.trim(),
    };

    if (idEditando !== null) {
      atualizarCanteiros(
        canteiros.map((canteiro) =>
          canteiro.id === idEditando
            ? { ...canteiro, ...dados }
            : canteiro
        )
      );
    } else {
      atualizarCanteiros([
        ...canteiros,
        { id: crypto.randomUUID(), ...dados, cultura: '-' },
      ]);
    }

    setFormularioAberto(false);
    setIdEditando(null);
  }

  function excluir(canteiro) {
    if (window.confirm(`Excluir ${canteiro.nome}?`)) {
      atualizarCanteiros(
        canteiros.filter((item) => item.id !== canteiro.id)
      );
    }
  }

  const filtrados = canteiros.filter((canteiro) =>
    canteiro.nome.toLowerCase().includes(busca.toLowerCase())
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
                {filtrados.map((canteiro) => (
                  <tr key={canteiro.id}>
                    <td>{canteiro.nome}</td>
                    <td>{canteiro.area} m²</td>
                    <td>{canteiro.cultura}</td>
                    <td>
                      <span className={`status-canteiro ${canteiro.status === 'DISPONÍVEL' ? 'disponivel' : canteiro.status === 'EM USO' ? 'em-uso' : 'em-preparo'}`}>
                        {canteiro.status}
                      </span>
                    </td>
                    <td>
                      <button className="acao-tabela" onClick={() => editar(canteiro)} aria-label={`Editar ${canteiro.nome}`}>
                        ✏️
                      </button>

                      <button className="acao-tabela" onClick={() => excluir(canteiro)} aria-label={`Excluir ${canteiro.nome}`}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
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
