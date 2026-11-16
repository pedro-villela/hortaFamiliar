import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import { requisicao } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const location = useLocation();

  const [dados, setDados] = useState({
    culturas: [],
    canteiros: [],
    plantios: [],
    tarefas: [],
    estoque: {
      resumo: { insumos_em_risco: 0 },
      estoque: []
    }
  });

  useEffect(() => {
    async function atualizarDados() {
      try {
        const [culturas, canteiros, plantios, tarefas, estoque] =
          await Promise.all([
            requisicao('/api/culturas'),
            requisicao('/api/canteiros'),
            requisicao('/api/plantios'),
            requisicao('/api/tarefas'),
            requisicao('/api/dashboard/estoque')
          ]);

        setDados({
          culturas: Array.isArray(culturas) ? culturas : [],
          canteiros: Array.isArray(canteiros) ? canteiros : [],
          plantios: Array.isArray(plantios) ? plantios : [],
          tarefas: Array.isArray(tarefas) ? tarefas : [],
          estoque: estoque || {
            resumo: { insumos_em_risco: 0 },
            estoque: []
          }
        });
      } catch (err) {
        console.error(err);
      }
    }

    atualizarDados();
  }, [location.key]);

  const { culturas, canteiros, plantios, tarefas, estoque } = dados;

  const totalCulturas = culturas.length;

  const canteirosEmUso = new Set(
    plantios
      .filter((p) => p.status === 'CRESCIMENTO')
      .map((p) => p.id_canteiro)
  ).size;

  const canteirosDisponiveis = Math.max(0, canteiros.length - canteirosEmUso);

  const plantiosEmAndamento = plantios.filter(
    (plantio) => plantio.status === 'CRESCIMENTO'
  ).length;

  const tarefasPendentes = tarefas.filter(
    (tarefa) => tarefa.status === 'PENDENTE'
  ).length;

  const itensEstoque = estoque.estoque || estoque.itens_abaixo_do_minimo || [];
  const itensEmRisco = itensEstoque.filter((item) => item.abaixo_do_minimo);
  const insumosBaixos =
    estoque.resumo?.insumos_em_risco ??
    estoque.total_insumos_em_alerta ??
    itensEmRisco.length;

  const tarefasConcluidas = tarefas.filter(
    (tarefa) => tarefa.status === 'CONCLUIDA'
  ).length;

  const tarefasAguardando = tarefas.filter(
    (tarefa) => tarefa.status === 'AGUARDANDO_APROVACAO'
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
      titulo: 'Plantios em crescimento',
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
                    <span>Aguardando aprovação</span>
                    <strong>{tarefasAguardando}</strong>
                  </div>

                  <div className="dashboard-barra-fundo">
                    <div
                      className="dashboard-barra andamento"
                      style={{
                        width: `${calcularPorcentagem(
                          tarefasAguardando
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
                {tarefas.slice(0, 5).map((tarefa) => (
                  <div
                    className="dashboard-tarefa"
                    key={tarefa.id_tarefa}
                  >
                    <div>
                      <strong>{tarefa.descricao}</strong>
                      <span>
                        {tarefa.data_tarefa
                          ? String(tarefa.data_tarefa).slice(0, 10)
                          : 'Sem data'}
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

            {itensEmRisco.map((insumo) => (
              <div
                className="dashboard-alerta-item"
                key={insumo.id_insumo}
              >
                <span>
                  ⚠️ {insumo.nome} ({insumo.tipo})
                </span>

                <strong>
                  Estoque: {insumo.quantidade_estoque} (Mín: {insumo.estoque_minimo})
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
