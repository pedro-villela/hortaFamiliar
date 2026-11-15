import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import FormularioTarefa from '../components/FormularioTarefa';
import ValidacaoRecursos from '../components/ValidacaoRecursos';
import { requisicao } from '../services/api';
import './Culturas.css';
import './Tarefas.css';

const formularioVazio = {
  descricao: '',
  canteiroId: '',
  responsavelId: '',
  data: '',
  inicio: '',
  fim: '',
  insumoId: '',
  quantidadeInsumo: ''
};

function Tarefas() {
  const [canteiros, setCanteiros] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [membros, setMembros] = useState([]);
  const [tarefas, setTarefas] = useState([]);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);
  const [validacao, setValidacao] = useState(null);

  async function carregarDados() {
    try {
      const [listaCanteiros, listaInsumos, listaUsuarios, listaTarefas] =
        await Promise.all([
          requisicao('/api/canteiros'),
          requisicao('/api/insumos'),
          requisicao('/api/usuarios'),
          requisicao('/api/tarefas')
        ]);

      setCanteiros(Array.isArray(listaCanteiros) ? listaCanteiros : []);
      setInsumos(Array.isArray(listaInsumos) ? listaInsumos : []);
      setMembros(Array.isArray(listaUsuarios) ? listaUsuarios : []);
      setTarefas(Array.isArray(listaTarefas) ? listaTarefas : []);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function novaTarefa() {
    setValidacao(null);
    setIdEditando(null);
    setFormulario({ ...formularioVazio });
    setFormularioAberto(true);
  }

  function editar(tarefa) {
    setValidacao(null);
    setIdEditando(tarefa.id_tarefa);

    setFormulario({
      descricao: tarefa.descricao || '',
      canteiroId: String(tarefa.id_canteiro),
      responsavelId: String(tarefa.id_usuario),
      data: String(tarefa.data_tarefa).slice(0, 10),
      inicio: String(tarefa.hora_inicio).slice(0, 5),
      fim: String(tarefa.hora_fim).slice(0, 5),
      insumoId: '',
      quantidadeInsumo: ''
    });

    setFormularioAberto(true);
  }

  function verificarRecursos() {
    const conflitos = [];
    const avisos = [];

    const canteiro = canteiros.find(
      (item) => String(item.id_canteiro) === String(formulario.canteiroId)
    );

    const responsavel = membros.find(
      (item) => String(item.id_usuario) === String(formulario.responsavelId)
    );

    const insumo = formulario.insumoId
      ? insumos.find(
          (item) => String(item.id_insumo) === String(formulario.insumoId)
        )
      : null;

    const descricao = formulario.descricao.trim();

    if (!descricao || !canteiro || !responsavel || !formulario.data) {
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

    const quantidadeInsumo = Number(formulario.quantidadeInsumo);

    if (formulario.insumoId) {
      if (
        !insumo ||
        formulario.quantidadeInsumo === '' ||
        !Number.isFinite(quantidadeInsumo) ||
        quantidadeInsumo <= 0
      ) {
        conflitos.push('Informe uma quantidade válida de insumo.');
      } else if (quantidadeInsumo > Number(insumo.quantidade_estoque)) {
        if (insumo.tipo === 'FERRAMENTA') {
          conflitos.push(
            `Ferramenta "${insumo.nome}" não possui unidades suficientes em estoque.`
          );
        } else {
          avisos.push(
            `Estoque insuficiente de "${insumo.nome}". A tarefa será criada com status AGUARDANDO_APROVACAO para aprovação excepcional do Administrador.`
          );
        }
      }
    }

    return {
      conflitos,
      avisos,
      canteiro,
      responsavel,
      insumo
    };
  }

  async function gravarTarefa() {
    const payload = {
      id_usuario: Number(formulario.responsavelId),
      id_canteiro: Number(formulario.canteiroId),
      descricao: formulario.descricao.trim(),
      data_tarefa: formulario.data,
      hora_inicio: formulario.inicio,
      hora_fim: formulario.fim
    };

    if (!idEditando && formulario.insumoId && formulario.quantidadeInsumo) {
      payload.insumos = [
        {
          id_insumo: Number(formulario.insumoId),
          quantidade: Number(formulario.quantidadeInsumo)
        }
      ];
    }

    try {
      if (idEditando !== null) {
        await requisicao(`/api/tarefas/${idEditando}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        const resposta = await requisicao('/api/tarefas', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (resposta?.alertas?.length > 0) {
          alert(resposta.alertas.join('\n'));
        }
      }

      await carregarDados();
      setFormularioAberto(false);
      setIdEditando(null);
      setValidacao(null);
      setFormulario({ ...formularioVazio });
    } catch (err) {
      alert(err.message);
    }
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

  async function aprovarExcepcionalmente(tarefa) {
    if (
      !window.confirm(
        `Aprovar excepcionalmente o estoque da tarefa "${tarefa.descricao}"?`
      )
    ) {
      return;
    }

    try {
      const resposta = await requisicao(
        `/api/tarefas/${tarefa.id_tarefa}/aprovar-estoque`,
        { method: 'POST' }
      );
      if (resposta?.alertas?.length > 0) {
        alert(resposta.alertas.join('\n'));
      }
      await carregarDados();
    } catch (err) {
      alert(err.message);
    }
  }

  async function cancelarTarefa(tarefa) {
    if (!window.confirm(`Cancelar a tarefa "${tarefa.descricao}"?`)) return;
    try {
      await requisicao(`/api/tarefas/${tarefa.id_tarefa}/cancelar`, {
        method: 'PATCH'
      });
      await carregarDados();
    } catch (err) {
      alert(err.message);
    }
  }

  async function excluir(tarefa) {
    if (!window.confirm(`Excluir a tarefa "${tarefa.descricao}"?`)) return;
    try {
      await requisicao(`/api/tarefas/${tarefa.id_tarefa}`, {
        method: 'DELETE'
      });
      await carregarDados();
    } catch (err) {
      alert(err.message);
    }
  }

  function formatarData(data) {
    if (!data) return '-';
    const [ano, mes, dia] = String(data).slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const correspondeBusca = (tarefa.descricao || '')
      .toLowerCase()
      .includes(busca.toLowerCase());

    const correspondeStatus =
      filtroStatus === 'TODOS' || tarefa.status === filtroStatus;

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
              <span>Aguardando aprovação</span>
              <strong>
                {tarefas.filter(
                  (item) => item.status === 'AGUARDANDO_APROVACAO'
                ).length}
              </strong>
            </div>

            <div className="tarefa-card">
              <span>Concluídas</span>
              <strong>
                {tarefas.filter(
                  (item) => item.status === 'CONCLUIDA'
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
              <option value="AGUARDANDO_APROVACAO">Aguardando aprovação</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
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
              avisos={validacao.avisos}
              voltar={voltarParaFormulario}
              confirmar={confirmarTarefa}
            />
          )}

          <div className="tabela-culturas-container">
            <table className="tabela-culturas">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Canteiro</th>
                  <th>Responsável</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {tarefasFiltradas.map((tarefa) => (
                  <tr key={tarefa.id_tarefa}>
                    <td>{tarefa.descricao}</td>
                    <td>{tarefa.local || tarefa.canteiro_identificacao}</td>
                    <td>{tarefa.responsavel || tarefa.usuario_nome}</td>
                    <td>{formatarData(tarefa.data_tarefa)}</td>
                    <td>
                      {String(tarefa.hora_inicio).slice(0, 5)} -{' '}
                      {String(tarefa.hora_fim).slice(0, 5)}
                    </td>
                    <td>
                      <span
                        className={`status-tarefa ${
                          tarefa.status === 'CONCLUIDA'
                            ? 'concluida'
                            : tarefa.status === 'AGUARDANDO_APROVACAO'
                            ? 'andamento'
                            : 'pendente'
                        }`}
                      >
                        {tarefa.status}
                      </span>
                    </td>
                    <td>
                      {tarefa.status === 'AGUARDANDO_APROVACAO' && (
                        <button
                          className="botao-verde"
                          onClick={() => aprovarExcepcionalmente(tarefa)}
                          style={{ marginRight: '6px', padding: '4px 8px', fontSize: '12px' }}
                        >
                          ✓ Aprovar Estoque
                        </button>
                      )}
                      {tarefa.status === 'PENDENTE' && (
                        <button
                          className="acao-tabela"
                          onClick={() => editar(tarefa)}
                          aria-label={`Editar ${tarefa.descricao}`}
                          title="Editar tarefa"
                        >
                          ✏️
                        </button>
                      )}
                      {(tarefa.status === 'PENDENTE' ||
                        tarefa.status === 'AGUARDANDO_APROVACAO') && (
                        <button
                          className="acao-tabela"
                          onClick={() => cancelarTarefa(tarefa)}
                          aria-label={`Cancelar ${tarefa.descricao}`}
                          title="Cancelar tarefa"
                        >
                          🚫
                        </button>
                      )}
                      <button
                        className="acao-tabela"
                        onClick={() => excluir(tarefa)}
                        aria-label={`Excluir ${tarefa.descricao}`}
                        title="Excluir tarefa"
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
