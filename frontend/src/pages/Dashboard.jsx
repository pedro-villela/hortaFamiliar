
import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import './Dashboard.css';

function lerDados(chave) {
  try {
    const dados = localStorage.getItem(chave);
    const resultado = dados ? JSON.parse(dados) : [];
    return Array.isArray(resultado) ? resultado : [];
  } catch {
    return [];
  }
}

function carregarDados() {
  return {
    culturas: lerDados('horta_culturas'),
    canteiros: lerDados('horta_canteiros'),
    plantios: lerDados('horta_plantios'),
    tarefas: lerDados('horta_tarefas'),
    insumos: lerDados('horta_insumos')
  };
}

function Dashboard() {
  const [dados, setDados] = useState(carregarDados);

  useEffect(() => {
    function atualizarDados() {
      setDados(carregarDados());
    }

    window.addEventListener('focus', atualizarDados);
    window.addEventListener('storage', atualizarDados);

    return () => {
      window.removeEventListener('focus', atualizarDados);
      window.removeEventListener('storage', atualizarDados);
    };
  }, []);

  const {
    culturas,
    canteiros,
    plantios,
    tarefas,
    insumos
  } = dados;

  // Indicadores gerais.
  const totalCulturas = culturas.length;

  const canteirosDisponiveis = canteiros.filter(
    (canteiro) => canteiro.status === 'DISPONÍVEL'
  ).length;

  const plantiosEmAndamento = plantios.filter(
    (plantio) => plantio.status === 'EM ANDAMENTO'
  ).length;

  const tarefasPendentes = tarefas.filter(
    (tarefa) => tarefa.status === 'PENDENTE'
  ).length;

  const insumosBaixos = insumos.filter(
    (insumo) =>
      Number(insumo.quantidade) <
      Number(insumo.estoqueMinimo)
  ).length;

  const tarefasConcluidas = tarefas.filter(
    (tarefa) => tarefa.status === 'CONCLUÍDA'
  ).length;

  // Dados do gráfico de tarefas.
  const tarefasEmAndamento = tarefas.filter(
    (tarefa) => tarefa.status === 'EM ANDAMENTO'
  ).length;

  const totalTarefas = tarefas.length;

  function calcularPorcentagem(quantidade) {
    if (totalTarefas === 0) return 0;

    return (quantidade / totalTarefas) * 100;
  }

  const indicadores = [
    {
      titulo: 'Culturas cadastradas',
      valor: totalCulturas,
      icone: '🌱'
    },
    {
      titulo: 'Canteiros disponíveis',
      valor: canteirosDisponiveis,
      icone: '🪴'
    },
    {
      titulo: 'Plantios em andamento',
      valor: plantiosEmAndamento,
      icone: '🌿'
    },
    {
      titulo: 'Tarefas pendentes',
      valor: tarefasPendentes,
      icone: '📋'
    },
    {
      titulo: 'Insumos com estoque baixo',
      valor: insumosBaixos,
      icone: '📦'
    },
    {
      titulo: 'Tarefas concluídas',
      valor: tarefasConcluidas,
      icone: '✅'
    }
  ];

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <div className="dashboard-cabecalho">
            <h1>Dashboard</h1>
            <p>
              Acompanhe os principais indicadores da horta.
            </p>
          </div>

          <section className="dashboard-indicadores">
            {indicadores.map((indicador) => (
              <article
                className="dashboard-indicador"
                key={indicador.titulo}
              >
                <div className="dashboard-indicador-topo">
                  <span className="dashboard-icone">
                    {indicador.icone}
                  </span>
                </div>

                <strong className="dashboard-valor">
                  {indicador.valor}
                </strong>

                <p>{indicador.titulo}</p>
              </article>
            ))}
          </section>

          <section className="dashboard-secoes">
            <article className="dashboard-painel">
              <h2>Status das tarefas</h2>

              <p className="dashboard-descricao">
                Distribuição das atividades cadastradas.
              </p>

              <div className="dashboard-grafico">
                <div className="dashboard-grafico-linha">
                  <div className="dashboard-grafico-info">
                    <span>Pendentes</span>
                    <strong>{tarefasPendentes}</strong>
                  </div>

                  <div className="dashboard-barra-fundo">
                    <div
                      className="dashboard-barra pendente"
                      style={{
                        width: `${calcularPorcentagem(
                          tarefasPendentes
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <div className="dashboard-grafico-linha">
                  <div className="dashboard-grafico-info">
                    <span>Em andamento</span>
                    <strong>{tarefasEmAndamento}</strong>
                  </div>

                  <div className="dashboard-barra-fundo">
                    <div
                      className="dashboard-barra andamento"
                      style={{
                        width: `${calcularPorcentagem(
                          tarefasEmAndamento
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <div className="dashboard-grafico-linha">
                  <div className="dashboard-grafico-info">
                    <span>Concluídas</span>
                    <strong>{tarefasConcluidas}</strong>
                  </div>

                  <div className="dashboard-barra-fundo">
                    <div
                      className="dashboard-barra concluida"
                      style={{
                        width: `${calcularPorcentagem(
                          tarefasConcluidas
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="dashboard-total">
                Total de tarefas: <strong>{totalTarefas}</strong>
              </p>
            </article>

            <article className="dashboard-painel">
              <h2>Tarefas cadastradas</h2>

              <p className="dashboard-descricao">
                Visão rápida das últimas atividades.
              </p>

              <div className="dashboard-lista-tarefas">
                {tarefas.slice(-5).reverse().map((tarefa) => (
                  <div
                    className="dashboard-tarefa"
                    key={tarefa.id}
                  >
                    <div>
                      <strong>{tarefa.titulo}</strong>
                      <span>
                        {tarefa.data || 'Sem data'}
                      </span>
                    </div>

                    <span className="dashboard-status">
                      {tarefa.status}
                    </span>
                  </div>
                ))}

                {tarefas.length === 0 && (
                  <p className="dashboard-vazio">
                    Nenhuma tarefa cadastrada.
                  </p>
                )}
              </div>
            </article>
          </section>

          <section className="dashboard-painel dashboard-alertas">
            <h2>Alertas de estoque</h2>

            {insumos
              .filter(
                (insumo) =>
                  Number(insumo.quantidade) <
                  Number(insumo.estoqueMinimo)
              )
              .map((insumo) => (
                <div
                  className="dashboard-alerta-item"
                  key={insumo.id}
                >
                  <span>⚠️ {insumo.nome}</span>

                  <strong>
                    {insumo.quantidade} {insumo.unidade}
                  </strong>
                </div>
              ))}

            {insumosBaixos === 0 && (
              <p className="dashboard-sem-alertas">
                Nenhum insumo abaixo do estoque mínimo.
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
