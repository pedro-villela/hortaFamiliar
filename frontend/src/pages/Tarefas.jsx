
import { useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import FormularioTarefa from '../components/FormularioTarefa';
import ValidacaoRecursos from '../components/ValidacaoRecursos';
import './Culturas.css';
import './Tarefas.css';

const canteirosPadrao = [
  { id: 1, nome: 'Canteiro A' },
  { id: 2, nome: 'Canteiro B' },
  { id: 3, nome: 'Canteiro C' },
  { id: 4, nome: 'Canteiro D' },
  { id: 5, nome: 'Canteiro E' }
];

const membrosPadrao = [
  { id: 1, nome: 'Ana Silva' },
  { id: 2, nome: 'Carlos Souza' },
  { id: 3, nome: 'Mariana Costa' }
];

const formularioVazio = {
  titulo: '',
  descricao: '',
  canteiroId: '',
  responsavelId: '',
  data: '',
  inicio: '',
  fim: '',
  prioridade: 'MÉDIA',
  status: 'PENDENTE',
  insumoId: '',
  quantidadeInsumo: ''
};

function lerDados(chave, padrao) {
  try {
    const salvos = localStorage.getItem(chave);
    return salvos ? JSON.parse(salvos) : padrao;
  } catch {
    return padrao;
  }
}

function Tarefas() {
  const [canteiros] = useState(() =>
    lerDados('horta_canteiros', canteirosPadrao)
  );

  const [insumos] = useState(() =>
    lerDados('horta_insumos', [])
  );

  const [membros] = useState(membrosPadrao);

  const [tarefas, setTarefas] = useState(() =>
    lerDados('horta_tarefas', [])
  );

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);
  const [validacao, setValidacao] = useState(null);

  function atualizarTarefas(lista) {
    setTarefas(lista);
    localStorage.setItem('horta_tarefas', JSON.stringify(lista));
  }

  function novaTarefa() {
    setValidacao(null);
    setIdEditando(null);
    setFormulario({ ...formularioVazio });
    setFormularioAberto(true);
  }

  function editar(tarefa) {
    setValidacao(null);
    setIdEditando(tarefa.id);

    setFormulario({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      canteiroId: String(tarefa.canteiroId),
      responsavelId: String(tarefa.responsavelId),
      data: tarefa.data,
      inicio: tarefa.inicio,
      fim: tarefa.fim,
      prioridade: tarefa.prioridade,
      status: tarefa.status,
      insumoId: tarefa.insumoId
        ? String(tarefa.insumoId)
        : '',
      quantidadeInsumo: tarefa.quantidadeInsumo
        ? String(tarefa.quantidadeInsumo)
        : ''
    });

    setFormularioAberto(true);
  }

 
  function verificarRecursos() {
    const conflitos = [];

    const canteiro = canteiros.find(
      (item) => String(item.id) === String(formulario.canteiroId)
    );

    const responsavel = membros.find(
      (item) => String(item.id) === String(formulario.responsavelId)
    );

    const insumo = formulario.insumoId
      ? insumos.find(
          (item) => String(item.id) === String(formulario.insumoId)
        )
      : null;

    const titulo = formulario.titulo.trim();

    if (!titulo || !canteiro || !responsavel || !formulario.data) {
      conflitos.push('Preencha todos os campos obrigatórios.');
    }

    if (
      !formulario.inicio ||
      !formulario.fim ||
      formulario.inicio >= formulario.fim
    ) {
      conflitos.push(
        'O horário de término deve ser posterior ao início.'
      );
    }

    const conflitoHorario = tarefas.some((tarefa) =>
      tarefa.id !== idEditando &&
      tarefa.status !== 'CONCLUÍDA' &&
      formulario.status !== 'CONCLUÍDA' &&
      String(tarefa.canteiroId) === String(formulario.canteiroId) &&
      tarefa.data === formulario.data &&
      formulario.inicio < tarefa.fim &&
      formulario.fim > tarefa.inicio
    );

    if (conflitoHorario) {
      conflitos.push(
        'Já existe uma tarefa agendada neste canteiro e horário.'
      );
    }

    const quantidadeInsumo = Number(formulario.quantidadeInsumo);

    if (formulario.insumoId) {
      if (
        !insumo ||
        formulario.quantidadeInsumo === '' ||
        !Number.isFinite(quantidadeInsumo) ||
        quantidadeInsumo <= 0
      ) {
        conflitos.push('Informe uma quantidade válida de insumo.');
      } else if (quantidadeInsumo > Number(insumo.quantidade)) {
        conflitos.push(
          'Quantidade solicitada maior que o estoque disponível.'
        );
      }
    }

    return {
      conflitos,
      canteiro,
      responsavel,
      insumo
    };
  }

  function gravarTarefa() {
    const resultado = verificarRecursos();

    if (resultado.conflitos.length > 0) {
      setValidacao(resultado);
      return;
    }

    const dados = {
      titulo: formulario.titulo.trim(),
      descricao: formulario.descricao.trim(),
      canteiroId: resultado.canteiro.id,
      responsavelId: resultado.responsavel.id,
      data: formulario.data,
      inicio: formulario.inicio,
      fim: formulario.fim,
      prioridade: formulario.prioridade,
      status: formulario.status,
      insumoId: formulario.insumoId || null,
      quantidadeInsumo: formulario.insumoId
        ? Number(formulario.quantidadeInsumo)
        : 0
    };

    if (idEditando !== null) {
      atualizarTarefas(
        tarefas.map((tarefa) =>
          tarefa.id === idEditando
            ? { ...tarefa, ...dados }
            : tarefa
        )
      );
    } else {
      atualizarTarefas([
        ...tarefas,
        {
          id: crypto.randomUUID(),
          ...dados
        }
      ]);
    }

    setFormularioAberto(false);
    setIdEditando(null);
    setValidacao(null);
    setFormulario({ ...formularioVazio });
  }

  function salvar(evento) {
    evento.preventDefault();

    const resultado = verificarRecursos();

    if (idEditando !== null) {
      if (resultado.conflitos.length > 0) {
        alert(resultado.conflitos.join('\n'));
        return;
      }

      gravarTarefa();
      return;
    }

    setValidacao(resultado);
    setFormularioAberto(false);
  }

  function voltarParaFormulario() {
    setValidacao(null);
    setFormularioAberto(true);
  }

  function confirmarTarefa() {
    gravarTarefa();
  }


  function excluir(tarefa) {
    if (window.confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) {
      atualizarTarefas(
        tarefas.filter((item) => item.id !== tarefa.id)
      );
    }
  }

  function obterNome(lista, id) {
    return lista.find(
      (item) => String(item.id) === String(id)
    )?.nome || 'Não encontrado';
  }

  function formatarData(data) {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const correspondeBusca = tarefa.titulo
      .toLowerCase()
      .includes(busca.toLowerCase());

    const correspondeStatus =
      filtroStatus === 'TODOS' ||
      tarefa.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Gerenciamento de Tarefas</h1>
          <p>
            Cadastre, atribua e acompanhe as atividades da horta.
          </p>

          <div className="tarefas-resumo">
            <div className="tarefa-card">
              <span>Total de tarefas</span>
              <strong>{tarefas.length}</strong>
            </div>

            <div className="tarefa-card">
              <span>Pendentes</span>
              <strong>
                {tarefas.filter(
                  (item) => item.status === 'PENDENTE'
                ).length}
              </strong>
            </div>

            <div className="tarefa-card">
              <span>Concluídas</span>
              <strong>
                {tarefas.filter(
                  (item) => item.status === 'CONCLUÍDA'
                ).length}
              </strong>
            </div>
          </div>

          <div className="tarefas-acoes">
            <input
              type="search"
              placeholder="Buscar tarefa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              aria-label="Filtrar por status"
            >
              <option value="TODOS">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM ANDAMENTO">Em andamento</option>
              <option value="CONCLUÍDA">Concluída</option>
            </select>

            <button className="botao-verde" onClick={novaTarefa}>
              + NOVA TAREFA
            </button>
          </div>

          {formularioAberto && (
            <FormularioTarefa
              formulario={formulario}
              setFormulario={setFormulario}
              canteiros={canteiros}
              insumos={insumos}
              membros={membros}
              salvar={salvar}
              cancelar={() => setFormularioAberto(false)}
              editando={idEditando !== null}
            />
          )}

         
{validacao && (
  <ValidacaoRecursos
    tarefa={formulario}
    canteiro={validacao.canteiro}
    responsavel={validacao.responsavel}
    insumo={validacao.insumo}
    conflitos={validacao.conflitos}
    voltar={voltarParaFormulario}
    confirmar={confirmarTarefa}
  />
)}
 

          <div className="tabela-culturas-container">
            <table className="tabela-culturas">
              <thead>
                <tr>
                  <th>Tarefa</th>
                  <th>Canteiro</th>
                  <th>Responsável</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {tarefasFiltradas.map((tarefa) => (
                  <tr key={tarefa.id}>
                    <td>{tarefa.titulo}</td>
                    <td>
                      {obterNome(canteiros, tarefa.canteiroId)}
                    </td>
                    <td>
                      {obterNome(membros, tarefa.responsavelId)}
                    </td>
                    <td>{formatarData(tarefa.data)}</td>
                    <td>{tarefa.inicio} - {tarefa.fim}</td>
                    <td>{tarefa.prioridade}</td>
                    <td>
                      <span className={`status-tarefa ${
                        tarefa.status === 'CONCLUÍDA'
                          ? 'concluida'
                          : tarefa.status === 'EM ANDAMENTO'
                          ? 'andamento'
                          : 'pendente'
                      }`}>
                        {tarefa.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="acao-tabela"
                        onClick={() => editar(tarefa)}
                        aria-label={`Editar ${tarefa.titulo}`}
                      >
                        ✏️
                      </button>
                      <button
                        className="acao-tabela"
                        onClick={() => excluir(tarefa)}
                        aria-label={`Excluir ${tarefa.titulo}`}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tarefasFiltradas.length === 0 && (
              <p className="lista-vazia">
                Nenhuma tarefa encontrada.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Tarefas;
