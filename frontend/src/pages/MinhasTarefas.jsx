import { useEffect, useState } from 'react';
import MenuMembro from '../components/MenuMembro';
import BarraSuperior from '../components/BarraSuperior';
import { requisicao, obterUsuarioLogado } from '../services/api';
import './MinhasTarefas.css';

function formatarData(data) {
  if (!data) return '-';

  const [ano, mes, dia] = String(data).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function MinhasTarefas() {
  const usuario = obterUsuarioLogado();
  const [tarefas, setTarefas] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [tarefaSelecionadaId, setTarefaSelecionadaId] = useState(null);
  const [tarefaConcluidaId, setTarefaConcluidaId] = useState(null);

  async function carregarMinhasTarefas() {
    try {
      const lista = await requisicao('/api/tarefas/minhas');
      setTarefas(Array.isArray(lista) ? lista : []);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarMinhasTarefas();
  }, []);

  const tarefasFiltradas = tarefas.filter(
    (tarefa) => filtro === 'TODOS' || tarefa.status === filtro
  );

  async function iniciarConclusao(tarefa) {
    if (tarefa.status === 'CONCLUIDA') {
      alert('Esta tarefa já foi concluída.');
      return;
    }

    const confirmar = window.confirm(
      `Deseja concluir a tarefa "${tarefa.descricao}"?`
    );

    if (!confirmar) return;

    try {
      await requisicao(`/api/tarefas/${tarefa.id_tarefa}/concluir`, {
        method: 'PATCH'
      });
      await carregarMinhasTarefas();
      setTarefaSelecionadaId(tarefa.id_tarefa);
      setTarefaConcluidaId(tarefa.id_tarefa);
    } catch (err) {
      alert(err.message);
    }
  }

  const tarefaSelecionada = tarefas.find(
    (tarefa) => String(tarefa.id_tarefa) === String(tarefaSelecionadaId)
  );

  function voltarParaLista() {
    setTarefaSelecionadaId(null);
    setTarefaConcluidaId(null);
  }

  const total = tarefas.length;

  const pendentes = tarefas.filter(
    (tarefa) => tarefa.status === 'PENDENTE'
  ).length;

  const concluidas = tarefas.filter(
    (tarefa) => tarefa.status === 'CONCLUIDA'
  ).length;

  return (
    <div className="layout-admin">
      <MenuMembro />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Minhas Tarefas</h1>

          <p>
            Olá, <strong>{usuario?.nome || 'Membro'}</strong>! Consulte suas atividades atribuídas e registre a conclusão.
          </p>

          {!tarefaSelecionada && (
            <>
              <div className="resumo-minhas-tarefas">
                <div className="resumo-membro-card">
                  <span>Total de tarefas</span>
                  <strong>{total}</strong>
                </div>

                <div className="resumo-membro-card">
                  <span>Pendentes</span>
                  <strong>{pendentes}</strong>
                </div>

                <div className="resumo-membro-card">
                  <span>Concluídas</span>
                  <strong>{concluidas}</strong>
                </div>
              </div>

              <div className="filtro-minhas-tarefas">
                <label htmlFor="filtro-tarefas">
                  Filtrar por status:
                </label>

                <select
                  id="filtro-tarefas"
                  value={filtro}
                  onChange={(evento) =>
                    setFiltro(evento.target.value)
                  }
                >
                  <option value="TODOS">Todas</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="AGUARDANDO_APROVACAO">
                    Aguardando aprovação
                  </option>
                  <option value="CONCLUIDA">Concluídas</option>
                </select>
              </div>

              <div className="lista-minhas-tarefas">
                {tarefasFiltradas.map((tarefa) => (
                  <article
                    className="cartao-minha-tarefa"
                    key={tarefa.id_tarefa}
                  >
                    <div className="cabecalho-minha-tarefa">
                      <h2>{tarefa.descricao}</h2>

                      <span
                        className={`status-minha-tarefa ${
                          tarefa.status === 'CONCLUIDA'
                            ? 'concluida'
                            : tarefa.status === 'AGUARDANDO_APROVACAO'
                            ? 'andamento'
                            : 'pendente'
                        }`}
                      >
                        {tarefa.status}
                      </span>
                    </div>

                    <p>
                      <strong>Canteiro:</strong>{' '}
                      {tarefa.local || tarefa.canteiro_identificacao}
                    </p>

                    <p>
                      <strong>Data:</strong>{' '}
                      {formatarData(tarefa.data_tarefa)}
                    </p>

                    <p>
                      <strong>Horário:</strong>{' '}
                      {String(tarefa.hora_inicio).slice(0, 5)} às{' '}
                      {String(tarefa.hora_fim).slice(0, 5)}
                    </p>

                    <button
                      type="button"
                      className="botao-detalhes-tarefa"
                      onClick={() => {
                        setTarefaSelecionadaId(tarefa.id_tarefa);
                        setTarefaConcluidaId(null);
                      }}
                    >
                      VER DETALHES
                    </button>

                    {tarefa.status === 'CONCLUIDA' ? (
                      <p className="mensagem-concluida">
                        ✓ Tarefa concluída
                      </p>
                    ) : tarefa.status === 'PENDENTE' ? (
                      <button
                        className="botao-verde"
                        type="button"
                        onClick={() => iniciarConclusao(tarefa)}
                      >
                        CONCLUIR TAREFA
                      </button>
                    ) : null}
                  </article>
                ))}

                {tarefasFiltradas.length === 0 && (
                  <p className="mensagem-sem-tarefas">
                    Nenhuma tarefa encontrada para o seu usuário.
                  </p>
                )}
              </div>
            </>
          )}

          {tarefaSelecionada && (
            <section
              className="detalhes-minha-tarefa"
              aria-label="Detalhes da tarefa"
            >
              {tarefaConcluidaId === tarefaSelecionada.id_tarefa ? (
                <div
                  className="confirmacao-minha-tarefa"
                  role="status"
                >
                  <h2>✓ Tarefa concluída com sucesso!</h2>
                  <p>
                    A atividade foi finalizada e os registros foram atualizados.
                  </p>
                  <p>
                    <strong>{tarefaSelecionada.descricao}</strong>
                  </p>

                  <button
                    type="button"
                    className="botao-verde"
                    onClick={voltarParaLista}
                  >
                    VOLTAR ÀS MINHAS TAREFAS
                  </button>
                </div>
              ) : (
                <>
                  <h2>{tarefaSelecionada.descricao}</h2>

                  <span
                    className={`status-minha-tarefa ${
                      tarefaSelecionada.status === 'CONCLUIDA'
                        ? 'concluida'
                        : tarefaSelecionada.status === 'AGUARDANDO_APROVACAO'
                        ? 'andamento'
                        : 'pendente'
                    }`}
                  >
                    {tarefaSelecionada.status}
                  </span>

                  <p>
                    <strong>Responsável:</strong>{' '}
                    {usuario?.nome}
                  </p>

                  <p>
                    <strong>Canteiro:</strong>{' '}
                    {tarefaSelecionada.local || tarefaSelecionada.canteiro_identificacao}
                  </p>

                  <p>
                    <strong>Data:</strong>{' '}
                    {formatarData(tarefaSelecionada.data_tarefa)}
                  </p>

                  <p>
                    <strong>Horário:</strong>{' '}
                    {String(tarefaSelecionada.hora_inicio).slice(0, 5)} às{' '}
                    {String(tarefaSelecionada.hora_fim).slice(0, 5)}
                  </p>

                  {tarefaSelecionada.status === 'CONCLUIDA' && (
                    <p className="mensagem-concluida">
                      ✓ Tarefa concluída
                    </p>
                  )}

                  <div className="acoes-detalhes-tarefa">
                    <button
                      type="button"
                      className="botao-detalhes-tarefa"
                      onClick={voltarParaLista}
                    >
                      VOLTAR
                    </button>

                    {tarefaSelecionada.status === 'PENDENTE' && (
                      <button
                        type="button"
                        className="botao-verde"
                        onClick={() => iniciarConclusao(tarefaSelecionada)}
                      >
                        CONCLUIR TAREFA
                      </button>
                    )}
                  </div>
                </>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default MinhasTarefas;
