
import { useEffect, useState } from 'react';
import MenuMembro from '../components/MenuMembro';
import BarraSuperior from '../components/BarraSuperior';
import './MinhasTarefas.css';
import RegistrarUtilizacaoInsumo from '../components/RegistrarUtilizacaoInsumo';


const membrosPadrao = [
  { id: 1, nome: 'Ana Silva' },
  { id: 2, nome: 'Carlos Souza' },
  { id: 3, nome: 'Mariana Costa' }
];

const canteirosPadrao = [
  { id: 1, nome: 'Canteiro A' },
  { id: 2, nome: 'Canteiro B' },
  { id: 3, nome: 'Canteiro C' },
  { id: 4, nome: 'Canteiro D' },
  { id: 5, nome: 'Canteiro E' }
];

function lerDados(chave, padrao) {
  try {
    const salvos = localStorage.getItem(chave);
    return salvos ? JSON.parse(salvos) : padrao;
  } catch {
    return padrao;
  }
}

function formatarData(data) {
  if (!data) return '-';

  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function MinhasTarefas() {
  const [membroId, setMembroId] = useState('1');

  const [tarefas, setTarefas] = useState(() =>
    lerDados('horta_tarefas', [])
  );

  const [canteiros] = useState(() =>
    lerDados('horta_canteiros', canteirosPadrao)
  );

  const [insumos, setInsumos] = useState(() =>
  lerDados('horta_insumos', [])
);

  const [filtro, setFiltro] = useState('TODOS');
  const [tarefaSelecionadaId, setTarefaSelecionadaId] = useState(null);
  const [tarefaConcluidaId, setTarefaConcluidaId] = useState(null);
  const [tarefaEmRegistroId, setTarefaEmRegistroId] = useState(null);


  // Atualiza os dados quando a página volta a ficar visível.
  useEffect(() => {
    function atualizar() {
      setTarefas(lerDados('horta_tarefas', []));
    }

    window.addEventListener('focus', atualizar);
    window.addEventListener('storage', atualizar);

    return () => {
      window.removeEventListener('focus', atualizar);
      window.removeEventListener('storage', atualizar);
    };
  }, []);

  function obterNome(lista, id) {
    return lista.find(
      (item) => String(item.id) === String(id)
    )?.nome || 'Não encontrado';
  }

  const tarefasDoMembro = tarefas.filter(
    (tarefa) => String(tarefa.responsavelId) === membroId
  );

  const tarefasFiltradas = tarefasDoMembro.filter(
    (tarefa) =>
      filtro === 'TODOS' || tarefa.status === filtro
  );

  
function iniciarConclusao(tarefa) {
  if (tarefa.status === 'CONCLUÍDA') {
    alert('Esta tarefa já foi concluída.');
    return;
  }

  // Se a tarefa utiliza insumo, abre o formulário.
  if (tarefa.insumoId) {
    setInsumos(lerDados('horta_insumos', []));
    setTarefaSelecionadaId(tarefa.id);
    setTarefaConcluidaId(null);
    setTarefaEmRegistroId(tarefa.id);
    return;
  }

  // Se não utiliza insumo, mantém a conclusão tradicional.
  concluirTarefa(tarefa);
}



  function concluirTarefa(tarefa, registroUtilizacao = null) {
    // 1. Impede concluir novamente uma tarefa finalizada.
    const tarefasAtuais = lerDados('horta_tarefas', []);

    const tarefaAtual = tarefasAtuais.find(
      (item) => item.id === tarefa.id
    );

    if (!tarefaAtual) {
      alert('Esta tarefa não foi encontrada.');
      setTarefas(tarefasAtuais);
      return;
    }

    if (tarefaAtual.status === 'CONCLUÍDA') {
      alert('Esta tarefa já foi concluída.');
      setTarefas(tarefasAtuais);
      return;
    }

    // 2. Carrega os insumos e o histórico mais recentes.
    const estoqueAtual = lerDados('horta_insumos', []);
    const historicoAtual = lerDados('horta_movimentacoes', []);

    let novosInsumos = estoqueAtual;
    let novoHistorico = historicoAtual;

    // 3. Verifica se a tarefa utiliza algum insumo.
    if (tarefaAtual.insumoId) {
      const insumo = estoqueAtual.find(
        (item) =>
          String(item.id) === String(tarefaAtual.insumoId)
      );

      if (!insumo) {
        alert('O insumo associado à tarefa não foi encontrado.');
        return;
      }

      const quantidade = Number(
      registroUtilizacao?.quantidade ?? tarefaAtual.quantidadeInsumo
);

      const saldoAnterior = Number(insumo.quantidade);

      // 4. Valida a quantidade e o saldo disponível.
      if (
        !Number.isFinite(quantidade) ||
        quantidade <= 0 ||
        !Number.isFinite(saldoAnterior) ||
        saldoAnterior < 0
      ) {
        alert('A quantidade ou o saldo do insumo é inválido.');
        return;
      }

      if (quantidade > saldoAnterior) {
        alert(
          `Estoque insuficiente de ${insumo.nome}. ` +
          `Disponível: ${saldoAnterior} ${insumo.unidade}. ` +
          `Necessário: ${quantidade} ${insumo.unidade}.`
        );
        return;
      }

      const saldoNovo = Number(
        (saldoAnterior - quantidade).toFixed(4)
      );

      // 5. Atualiza a quantidade do insumo.
      novosInsumos = estoqueAtual.map((item) =>
        String(item.id) === String(insumo.id)
          ? { ...item, quantidade: saldoNovo }
          : item
      );

      // 6. Registra a saída no histórico.
      const movimentacao = {
        id: crypto.randomUUID(),
        insumoId: insumo.id,
        insumoNome: insumo.nome,
        unidade: insumo.unidade,
        tipo: 'SAÍDA',
        quantidade,
        saldoAnterior,
        saldoNovo,
        observacao: registroUtilizacao?.observacao
  ? `Consumo na tarefa: ${tarefaAtual.titulo}. ${registroUtilizacao.observacao}`
  : `Consumo na tarefa: ${tarefaAtual.titulo}`,

        data: new Date().toISOString(),
        origem: 'TAREFA',
        tarefaId: tarefaAtual.id
      };

      novoHistorico = [
        movimentacao,
        ...historicoAtual
      ];
    }

    // 7. Pede confirmação antes de concluir.
    const confirmar = window.confirm(
      `Deseja concluir a tarefa "${tarefaAtual.titulo}"?`
    );

    if (!confirmar) return;

    // 8. Atualiza o status da tarefa.
    const tarefasAtualizadas = tarefasAtuais.map((item) =>
      item.id === tarefaAtual.id
        ? {
            ...item,
            status: 'CONCLUÍDA',
            concluidaEm: new Date().toISOString()
          }
        : item
    );

    // 9. Salva os dados atualizados.
    if (tarefaAtual.insumoId) {
      localStorage.setItem(
        'horta_insumos',
        JSON.stringify(novosInsumos)
      );

      localStorage.setItem(
        'horta_movimentacoes',
        JSON.stringify(novoHistorico)
      );
    }

    localStorage.setItem(
      'horta_tarefas',
      JSON.stringify(tarefasAtualizadas)
    );

    // 10. Atualiza a tela.
    setTarefas(tarefasAtualizadas);

    setTarefaSelecionadaId(tarefaAtual.id);
    setTarefaConcluidaId(tarefaAtual.id);
    setTarefaEmRegistroId(null);
  }

  const tarefaSelecionada = tarefasDoMembro.find(
    (tarefa) => String(tarefa.id) === String(tarefaSelecionadaId)
  );



const tarefaEmRegistro = tarefasDoMembro.find(
  (tarefa) => String(tarefa.id) === String(tarefaEmRegistroId)
);

const insumoEmRegistro = tarefaEmRegistro
  ? insumos.find(
      (item) =>
        String(item.id) === String(tarefaEmRegistro.insumoId)
    )
  : null;


  const insumoSelecionado = tarefaSelecionada
    ? insumos.find(
        (item) => String(item.id) === String(tarefaSelecionada.insumoId)
      )
    : null;

  function voltarParaLista() {
    setTarefaSelecionadaId(null);
    setTarefaConcluidaId(null);
  }

  const total = tarefasDoMembro.length;

  const pendentes = tarefasDoMembro.filter(
    (tarefa) => tarefa.status === 'PENDENTE'
  ).length;

  const concluidas = tarefasDoMembro.filter(
    (tarefa) => tarefa.status === 'CONCLUÍDA'
  ).length;

function cancelarUtilizacao() {
    setTarefaEmRegistroId(null);
  }

  function confirmarUtilizacao(dadosUtilizacao) {
    if (!tarefaEmRegistro) {
      alert('Nenhuma tarefa selecionada.');
      return;
    }

    concluirTarefa(tarefaEmRegistro, dadosUtilizacao);
  }

  // RETURN PRINCIPAL: começa a estrutura visual da página

  return (
    <div className="layout-admin">
      <MenuMembro />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Minhas Tarefas</h1>

          <p>
            Consulte suas atividades e registre a conclusão.
          </p>

          {!tarefaSelecionada && !tarefaEmRegistroId && (
            <>
              <div className="seletor-membro">
                <label htmlFor="membro-atual">
                  Visualizar tarefas de:
                </label>

                <select
                  id="membro-atual"
                  value={membroId}
                  onChange={(evento) => {
                    setMembroId(evento.target.value);
                    voltarParaLista();
                  }}
                >
                  {membrosPadrao.map((membro) => (
                    <option
                      key={membro.id}
                      value={membro.id}
                    >
                      {membro.nome}
                    </option>
                  ))}
                </select>
              </div>

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
                  <option value="EM ANDAMENTO">
                    Em andamento
                  </option>
                  <option value="CONCLUÍDA">Concluídas</option>
                </select>
              </div>

              <div className="lista-minhas-tarefas">
                {tarefasFiltradas.map((tarefa) => {
                  const insumo = insumos.find(
                    (item) =>
                      String(item.id) === String(tarefa.insumoId)
                  );

                  return (
                    <article
                      className="cartao-minha-tarefa"
                      key={tarefa.id}
                    >
                      <div className="cabecalho-minha-tarefa">
                        <h2>{tarefa.titulo}</h2>

                        <span className={`status-minha-tarefa ${
                          tarefa.status === 'CONCLUÍDA'
                            ? 'concluida'
                            : tarefa.status === 'EM ANDAMENTO'
                            ? 'andamento'
                            : 'pendente'
                        }`}>
                          {tarefa.status}
                        </span>
                      </div>

                      <p>
                        <strong>Descrição:</strong>{' '}
                        {tarefa.descricao || 'Sem descrição'}
                      </p>

                      <p>
                        <strong>Canteiro:</strong>{' '}
                        {obterNome(canteiros, tarefa.canteiroId)}
                      </p>

                      <p>
                        <strong>Data:</strong>{' '}
                        {formatarData(tarefa.data)}
                      </p>

                      <p>
                        <strong>Horário:</strong>{' '}
                        {tarefa.inicio} às {tarefa.fim}
                      </p>

                      <p>
                        <strong>Prioridade:</strong>{' '}
                        {tarefa.prioridade}
                      </p>

                      {insumo && (
                        <p>
                          <strong>Insumo previsto:</strong>{' '}
                          {insumo.nome} — {tarefa.quantidadeInsumo}{' '}
                          {insumo.unidade}
                        </p>
                      )}

                      <button
                        type="button"
                        className="botao-detalhes-tarefa"
                        onClick={() => {
                          setTarefaSelecionadaId(tarefa.id);
                          setTarefaConcluidaId(null);
                        }}
                      >
                        VER DETALHES
                      </button>

                      {tarefa.status === 'CONCLUÍDA' ? (
                        <p className="mensagem-concluida">
                          ✓ Tarefa concluída
                        </p>
                      ) : (
                        <button
                          className="botao-verde"
                          type="button"
                          onClick={() => iniciarConclusao(tarefa)}
                        >
                          CONCLUIR TAREFA
                        </button>
                      )}
                    </article>
                  );
                })}

                {tarefasFiltradas.length === 0 && (
                  <p className="mensagem-sem-tarefas">
                    Nenhuma tarefa encontrada para este membro.
                  </p>
                )}
              </div>
            </>
          )}


{tarefaEmRegistro && insumoEmRegistro && (
  <RegistrarUtilizacaoInsumo
    key={tarefaEmRegistro.id}
    tarefa={tarefaEmRegistro}
    insumo={insumoEmRegistro}
    voltar={cancelarUtilizacao}
    confirmar={confirmarUtilizacao}
  />
)}

          {tarefaSelecionada && !tarefaEmRegistroId && (
            <section
              className="detalhes-minha-tarefa"
              aria-label="Detalhes da tarefa"
            >
              {tarefaConcluidaId === tarefaSelecionada.id ? (
                <div
                  className="confirmacao-minha-tarefa"
                  role="status"
                >
                  <h2>✓ Tarefa concluída com sucesso!</h2>
                  <p>
                    A atividade foi finalizada e os registros foram atualizados.
                  </p>
                  <p>
                    <strong>{tarefaSelecionada.titulo}</strong>
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
                  <h2>{tarefaSelecionada.titulo}</h2>

                  <span className={`status-minha-tarefa ${
                    tarefaSelecionada.status === 'CONCLUÍDA'
                      ? 'concluida'
                      : tarefaSelecionada.status === 'EM ANDAMENTO'
                      ? 'andamento'
                      : 'pendente'
                  }`}>
                    {tarefaSelecionada.status}
                  </span>

                  <p>
                    <strong>Descrição:</strong>{' '}
                    {tarefaSelecionada.descricao || 'Sem descrição'}
                  </p>

                  <p>
                    <strong>Responsável:</strong>{' '}
                    {obterNome(membrosPadrao, tarefaSelecionada.responsavelId)}
                  </p>

                  <p>
                    <strong>Canteiro:</strong>{' '}
                    {obterNome(canteiros, tarefaSelecionada.canteiroId)}
                  </p>

                  <p>
                    <strong>Data:</strong>{' '}
                    {formatarData(tarefaSelecionada.data)}
                  </p>

                  <p>
                    <strong>Horário:</strong>{' '}
                    {tarefaSelecionada.inicio} às {tarefaSelecionada.fim}
                  </p>

                  <p>
                    <strong>Prioridade:</strong>{' '}
                    {tarefaSelecionada.prioridade}
                  </p>

                  {tarefaSelecionada.insumoId && (
                    <p>
                      <strong>Insumo previsto:</strong>{' '}
                      {insumoSelecionado
                        ? `${insumoSelecionado.nome} — ${tarefaSelecionada.quantidadeInsumo} ${insumoSelecionado.unidade}`
                        : 'Insumo não encontrado'}
                    </p>
                  )}

                  {tarefaSelecionada.status === 'CONCLUÍDA' && (
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

                    {tarefaSelecionada.status !== 'CONCLUÍDA' && (
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
