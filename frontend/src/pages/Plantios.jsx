
import { useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import FormularioPlantio from '../components/FormularioPlantio';
import './Culturas.css';
import './Plantios.css';

const culturasIniciais = [
  { id: 1, nome: 'Alface', maturacao: 45 },
  { id: 2, nome: 'Couve', maturacao: 60 },
  { id: 3, nome: 'Tomate', maturacao: 90 },
  { id: 4, nome: 'Cenoura', maturacao: 80 },
  { id: 5, nome: 'Rúcula', maturacao: 35 }
];

const canteirosIniciais = [
  { id: 1, nome: 'Canteiro A', area: 10, status: 'EM USO' },
  { id: 2, nome: 'Canteiro B', area: 12, status: 'DISPONÍVEL' },
  { id: 3, nome: 'Canteiro C', area: 8, status: 'EM USO' },
  { id: 4, nome: 'Canteiro D', area: 15, status: 'EM PREPARO' },
  { id: 5, nome: 'Canteiro E', area: 9, status: 'EM USO' }
];

const formularioVazio = {
  culturaId: '',
  canteiroId: '',
  dataPlantio: '',
  status: 'PLANEJADO',
  observacoes: ''
};

function lerDados(chave, dadosPadrao) {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : dadosPadrao;
  } catch {
    return dadosPadrao;
  }
}

function calcularColheita(dataPlantio, dias) {
  if (!dataPlantio || !Number.isFinite(Number(dias))) {
    return '-';
  }

  const data = new Date(`${dataPlantio}T12:00:00`);
  data.setDate(data.getDate() + Number(dias));

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
  if (!data || data === '-') return '-';

  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function Plantios() {
  const [culturas] = useState(() =>
    lerDados('horta_culturas', culturasIniciais)
  );

  const [canteiros] = useState(() =>
    lerDados('horta_canteiros', canteirosIniciais)
  );

  const [plantios, setPlantios] = useState(() =>
    lerDados('horta_plantios', [])
  );

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);

  function atualizarPlantios(lista) {
    setPlantios(lista);
    localStorage.setItem('horta_plantios', JSON.stringify(lista));
  }

  function novoPlantio() {
    setIdEditando(null);
    setFormulario({ ...formularioVazio });
    setFormularioAberto(true);
  }

  function editar(plantio) {
    setIdEditando(plantio.id);

    setFormulario({
      culturaId: String(plantio.culturaId),
      canteiroId: String(plantio.canteiroId),
      dataPlantio: plantio.dataPlantio,
      status: plantio.status,
      observacoes: plantio.observacoes || ''
    });

    setFormularioAberto(true);
  }

  function salvar(evento) {
    evento.preventDefault();

    const cultura = culturas.find(
      (item) => String(item.id) === formulario.culturaId
    );

    const canteiro = canteiros.find(
      (item) => String(item.id) === formulario.canteiroId
    );

    if (!cultura || !canteiro || !formulario.dataPlantio) {
      alert('Selecione uma cultura, um canteiro e uma data.');
      return;
    }

    if (
      formulario.status !== 'CONCLUÍDO' &&
      canteiro.status === 'EM PREPARO'
    ) {
      alert('Este canteiro está em preparo e não pode receber plantios ativos.');
      return;
    }

    const conflito = plantios.some(
      (plantio) =>
        String(plantio.canteiroId) === formulario.canteiroId &&
        plantio.id !== idEditando &&
        plantio.status !== 'CONCLUÍDO' &&
        formulario.status !== 'CONCLUÍDO'
    );

    if (conflito) {
      alert('Este canteiro já possui um plantio não concluído.');
      return;
    }

    const dados = {
      culturaId: cultura.id,
      canteiroId: canteiro.id,
      dataPlantio: formulario.dataPlantio,
      previsaoColheita: calcularColheita(
        formulario.dataPlantio,
        cultura.maturacao
      ),
      status: formulario.status,
      observacoes: formulario.observacoes.trim()
    };

    if (idEditando !== null) {
      atualizarPlantios(
        plantios.map((plantio) =>
          plantio.id === idEditando
            ? { ...plantio, ...dados }
            : plantio
        )
      );
    } else {
      atualizarPlantios([
        ...plantios,
        { id: crypto.randomUUID(), ...dados }
      ]);
    }

    setFormularioAberto(false);
    setIdEditando(null);
  }

  function excluir(plantio) {
    if (window.confirm('Deseja realmente excluir este plantio?')) {
      atualizarPlantios(
        plantios.filter((item) => item.id !== plantio.id)
      );
    }
  }

  function obterCultura(id) {
    return culturas.find(
      (cultura) => String(cultura.id) === String(id)
    );
  }

  function obterCanteiro(id) {
    return canteiros.find(
      (canteiro) => String(canteiro.id) === String(id)
    );
  }

  const filtrados = plantios.filter((plantio) => {
    const nomeCultura = obterCultura(plantio.culturaId)?.nome || '';
    const nomeCanteiro = obterCanteiro(plantio.canteiroId)?.nome || '';

    const correspondeBusca =
      nomeCultura.toLowerCase().includes(busca.toLowerCase()) ||
      nomeCanteiro.toLowerCase().includes(busca.toLowerCase());

    const correspondeStatus =
      filtroStatus === 'TODOS' ||
      plantio.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Plantios</h1>
          <p>Registre e acompanhe os plantios da horta.</p>

          <div className="plantios-resumo">
            <div className="plantio-card">
              <span>Total de plantios</span>
              <strong>{plantios.length}</strong>
            </div>

            <div className="plantio-card">
              <span>Em andamento</span>
              <strong>
                {plantios.filter(
                  (item) => item.status === 'EM ANDAMENTO'
                ).length}
              </strong>
            </div>

            <div className="plantio-card">
              <span>Concluídos</span>
              <strong>
                {plantios.filter(
                  (item) => item.status === 'CONCLUÍDO'
                ).length}
              </strong>
            </div>
          </div>

          <div className="plantios-acoes">
            <input
              type="search"
              placeholder="Buscar cultura ou canteiro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              aria-label="Filtrar plantios por status"
            >
              <option value="TODOS">Todos os status</option>
              <option value="PLANEJADO">Planejado</option>
              <option value="EM ANDAMENTO">Em andamento</option>
              <option value="CONCLUÍDO">Concluído</option>
            </select>

            <button className="botao-verde" onClick={novoPlantio}>
              + NOVO PLANTIO
            </button>
          </div>

          {formularioAberto && (
            <FormularioPlantio
              formulario={formulario}
              setFormulario={setFormulario}
              culturas={culturas}
              canteiros={canteiros}
              salvar={salvar}
              cancelar={() => setFormularioAberto(false)}
              editando={idEditando !== null}
            />
          )}

          <div className="tabela-culturas-container">
            <table className="tabela-culturas">
              <thead>
                <tr>
                  <th>Cultura</th>
                  <th>Canteiro</th>
                  <th>Data do plantio</th>
                  <th>Previsão de colheita</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map((plantio) => (
                  <tr key={plantio.id}>
                    <td>
                      {obterCultura(plantio.culturaId)?.nome ||
                        'Cultura não encontrada'}
                    </td>

                    <td>
                      {obterCanteiro(plantio.canteiroId)?.nome ||
                        'Canteiro não encontrado'}
                    </td>

                    <td>{formatarData(plantio.dataPlantio)}</td>

                    <td>{formatarData(plantio.previsaoColheita)}</td>

                    <td>
                      <span className={`status-plantio ${
                        plantio.status === 'CONCLUÍDO'
                          ? 'concluido'
                          : plantio.status === 'EM ANDAMENTO'
                          ? 'andamento'
                          : 'planejado'
                      }`}>
                        {plantio.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="acao-tabela"
                        onClick={() => editar(plantio)}
                        aria-label="Editar plantio"
                      >
                        ✏️
                      </button>

                      <button
                        className="acao-tabela"
                        onClick={() => excluir(plantio)}
                        aria-label="Excluir plantio"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtrados.length === 0 && (
              <p className="lista-vazia">
                Nenhum plantio encontrado.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Plantios;

