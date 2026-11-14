
import { useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import './Culturas.css';

const dadosIniciais = [
  { id: 1, nome: 'Alface', maturacao: 45, espacamento: 25 },
  { id: 2, nome: 'Couve', maturacao: 60, espacamento: 40 },
  { id: 3, nome: 'Tomate', maturacao: 90, espacamento: 50 },
  { id: 4, nome: 'Cenoura', maturacao: 80, espacamento: 10 },
  { id: 5, nome: 'Rúcula', maturacao: 35, espacamento: 20 },
];

function carregarCulturas() {
  try {
    const salvas = localStorage.getItem('horta_culturas');
    return salvas ? JSON.parse(salvas) : dadosIniciais;
  } catch {
    return dadosIniciais;
  }
}

function Culturas() {
  const [culturas, setCulturas] = useState(carregarCulturas);
  const [busca, setBusca] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [formulario, setFormulario] = useState({
    nome: '',
    maturacao: '',
    espacamento: '',
  });

  function atualizarCulturas(novaLista) {
    setCulturas(novaLista);
    localStorage.setItem('horta_culturas', JSON.stringify(novaLista));
  }

  function abrirCadastro() {
    setIdEditando(null);
    setFormulario({ nome: '', maturacao: '', espacamento: '' });
    setFormularioAberto(true);
  }

  function editar(cultura) {
    setIdEditando(cultura.id);
    setFormulario({
      nome: cultura.nome,
      maturacao: String(cultura.maturacao),
      espacamento: String(cultura.espacamento),
    });
    setFormularioAberto(true);
  }

  function salvar(evento) {
    evento.preventDefault();

    const nome = formulario.nome.trim();
    const maturacao = Number(formulario.maturacao);
    const espacamento = Number(formulario.espacamento);

    if (!nome || maturacao <= 0 || espacamento <= 0) {
      alert('Preencha todos os campos com valores válidos.');
      return;
    }

    const nomeDuplicado = culturas.some(
      (cultura) =>
        cultura.nome.toLowerCase() === nome.toLowerCase() &&
        cultura.id !== idEditando
    );

    if (nomeDuplicado) {
      alert('Já existe uma cultura com esse nome.');
      return;
    }

    if (idEditando !== null) {
      atualizarCulturas(
        culturas.map((cultura) =>
          cultura.id === idEditando
            ? { ...cultura, nome, maturacao, espacamento }
            : cultura
        )
      );
    } else {
      const novaCultura = {
        id: crypto.randomUUID(),
        nome,
        maturacao,
        espacamento,
      };

      atualizarCulturas([...culturas, novaCultura]);
    }

    setFormularioAberto(false);
    setIdEditando(null);
  }

  function excluir(cultura) {
    const confirmou = window.confirm(
      `Deseja realmente excluir a cultura ${cultura.nome}?`
    );

    if (confirmou) {
      atualizarCulturas(
        culturas.filter((item) => item.id !== cultura.id)
      );
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

              <label htmlFor="espacamento">Espaçamento ideal (cm)</label>
              <input
                id="espacamento"
                type="number"
                min="1"
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
                  <tr key={cultura.id}>
                    <td>{cultura.nome}</td>
                    <td>{cultura.maturacao} dias</td>
                    <td>{cultura.espacamento} cm</td>
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
