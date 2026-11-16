import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import { requisicao } from '../services/api';
import './Relatorios.css';

function formatarData(data) {
  if (!data) return '-';

  const dia = String(data).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
    return '-';
  }

  const [ano, mes, diaMes] = dia.split('-');

  return `${diaMes}/${mes}/${ano}`;
}

function dentroDoPeriodo(data, inicio, fim) {
  if (!data) return false;

  const dia = String(data).slice(0, 10);

  if (inicio && dia < inicio) return false;
  if (fim && dia > fim) return false;

  return true;
}

function Relatorios() {
  const [tarefas, setTarefas] = useState([]);
  const [plantios, setPlantios] = useState([]);
  const [producao, setProducao] = useState({
    resumo: {
      total_plantios: 0,
      produtividade_total_kg: 0
    },
    produtividadePorCulturaECanteiro: []
  });

  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  async function carregarRelatorios(inicio = '', fim = '') {
    try {
      const inicioParam = inicio || '2000-01-01';
      const fimParam = fim || '2099-12-31';

      const [listaTarefas, listaPlantios, dadosProducao] = await Promise.all([
        requisicao('/api/tarefas'),
        requisicao('/api/plantios'),
        requisicao(
          `/api/dashboard/producao?data_inicio=${inicioParam}&data_fim=${fimParam}`
        )
      ]);

      setTarefas(Array.isArray(listaTarefas) ? listaTarefas : []);
      setPlantios(Array.isArray(listaPlantios) ? listaPlantios : []);
      if (dadosProducao) {
        setProducao(dadosProducao);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const tarefasFiltradas = tarefas.filter((tarefa) =>
    dentroDoPeriodo(tarefa.data_tarefa, dataInicial, dataFinal)
  );

  const plantiosFiltrados = plantios.filter((plantio) =>
    dentroDoPeriodo(plantio.data_plantio, dataInicial, dataFinal)
  );

  const colheitasFiltradas = plantiosFiltrados.filter(
    (p) => p.status === 'COLHIDO'
  );

  const totalColheitas = Number(
    producao.resumo?.total_plantios ??
      producao.resumo_geral?.total_plantios_colhidos ??
      0
  );
  const totalKg = Number(
    producao.resumo?.produtividade_total_kg ??
      producao.resumo_geral?.peso_total_colhido_kg ??
      0
  );
  const producaoPorCultura =
    producao.produtividadePorCulturaECanteiro ||
    producao.producao_por_cultura ||
    [];

  const tarefasConcluidas = tarefasFiltradas.filter(
    (tarefa) => tarefa.status === 'CONCLUIDA'
  ).length;

  const tarefasPendentes = tarefasFiltradas.filter(
    (tarefa) => tarefa.status === 'PENDENTE'
  ).length;

  const tarefasAguardando = tarefasFiltradas.filter(
    (tarefa) => tarefa.status === 'AGUARDANDO_APROVACAO'
  ).length;

  const totalTarefas = tarefasFiltradas.length;

  const percentualConcluidas = totalTarefas
    ? (tarefasConcluidas / totalTarefas) * 100
    : 0;

  const percentualPendentes = totalTarefas
    ? (tarefasPendentes / totalTarefas) * 100
    : 0;

  const percentualAguardando = totalTarefas
    ? (tarefasAguardando / totalTarefas) * 100
    : 0;

  function atualizarRelatorio() {
    if (dataInicial && dataFinal && dataInicial > dataFinal) {
      alert('A data inicial não pode ser maior que a final.');
      return;
    }

    carregarRelatorios(dataInicial, dataFinal);
  }

  function imprimirRelatorio() {
    window.print();
  }

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard relatorios-pagina">
          <header className="relatorios-cabecalho">
            <h1>Relatórios Gerenciais</h1>
            <p>
              Acompanhe atividades, plantios e a produtividade consolidada da horta.
            </p>
          </header>

          <section className="relatorios-filtros">
            <div>
              <label htmlFor="data-inicial">
                Data inicial
              </label>

              <input
                id="data-inicial"
                type="date"
                value={dataInicial}
                onChange={(evento) =>
                  setDataInicial(evento.target.value)
                }
              />
            </div>

            <div>
              <label htmlFor="data-final">
                Data final
              </label>

              <input
                id="data-final"
                type="date"
                value={dataFinal}
                onChange={(evento) =>
                  setDataFinal(evento.target.value)
                }
              />
            </div>

            <button
              type="button"
              className="botao-verde"
              onClick={atualizarRelatorio}
            >
              Filtrar / Atualizar
            </button>

            <button
              type="button"
              className="relatorios-botao-imprimir"
              onClick={imprimirRelatorio}
            >
              Imprimir / Salvar PDF
            </button>
          </section>

          <section className="relatorios-indicadores">
            <article>
              <span>Tarefas concluídas</span>
              <strong>{tarefasConcluidas}</strong>
            </article>

            <article>
              <span>Tarefas pendentes</span>
              <strong>{tarefasPendentes}</strong>
            </article>

            <article>
              <span>Aguardando aprovação</span>
              <strong>{tarefasAguardando}</strong>
            </article>

            <article>
              <span>Plantios no período</span>
              <strong>{plantiosFiltrados.length}</strong>
            </article>
          </section>

          <section className="relatorios-indicadores relatorios-indicadores-producao">
            <article>
              <span>Colheitas realizadas</span>
              <strong>{totalColheitas}</strong>
            </article>

            <article>
              <span>Produção total em kg</span>
              <strong>{totalKg.toFixed(2)} kg</strong>
            </article>

            <article>
              <span>Registros colhidos</span>
              <strong>{producaoPorCultura.length}</strong>
            </article>
          </section>

          <section className="relatorios-secao">
            <h2>Distribuição das tarefas</h2>

            <div className="relatorios-grafico">
              {[
                {
                  nome: 'Concluídas',
                  valor: tarefasConcluidas,
                  percentual: percentualConcluidas,
                  classe: 'concluidas'
                },
                {
                  nome: 'Aguardando aprovação',
                  valor: tarefasAguardando,
                  percentual: percentualAguardando,
                  classe: 'andamento'
                },
                {
                  nome: 'Pendentes',
                  valor: tarefasPendentes,
                  percentual: percentualPendentes,
                  classe: 'pendentes'
                }
              ].map((item) => (
                <div
                  className="relatorios-grafico-item"
                  key={item.nome}
                >
                  <div className="relatorios-grafico-legenda">
                    <span>{item.nome}</span>
                    <strong>{item.valor}</strong>
                  </div>

                  <div className="relatorios-grafico-fundo">
                    <div
                      className={`relatorios-grafico-barra ${item.classe}`}
                      style={{
                        width: `${item.percentual}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="relatorios-secao">
            <h2>Produtividade por Cultura e Canteiro (História #12)</h2>
            <div className="relatorios-tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Cultura</th>
                    <th>Canteiro</th>
                    <th>Quantidade produzida (kg)</th>
                    <th>Média por colheita (kg)</th>
                    <th>Número de colheitas</th>
                  </tr>
                </thead>
                <tbody>
                  {producaoPorCultura.map((item) => (
                    <tr key={`${item.id_cultura}-${item.id_canteiro}`}>
                      <td>{item.cultura || item.cultura_nome}</td>
                      <td>{item.canteiro || item.canteiro_identificacao}</td>
                      <td>
                        {Number(
                          item.produtividade_total_kg ?? item.peso_total_kg ?? 0
                        ).toFixed(2)}{' '}
                        kg
                      </td>
                      <td>
                        {Number(item.produtividade_media_kg || 0).toFixed(2)} kg
                      </td>
                      <td>{item.total_plantios ?? item.total_colheitas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {producaoPorCultura.length === 0 && (
                <p className="relatorios-vazio">Nenhuma produção encontrada no período.</p>
              )}
            </div>
          </section>

          <section className="relatorios-secao">
            <h2>Relatório de tarefas</h2>

            <div className="relatorios-tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Responsável</th>
                    <th>Canteiro</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tarefasFiltradas.map((tarefa) => (
                    <tr key={tarefa.id_tarefa}>
                      <td>{tarefa.descricao}</td>
                      <td>{tarefa.responsavel || tarefa.usuario_nome}</td>
                      <td>{tarefa.local || tarefa.canteiro_identificacao}</td>
                      <td>{formatarData(tarefa.data_tarefa)}</td>
                      <td>{tarefa.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tarefasFiltradas.length === 0 && (
                <p className="relatorios-vazio">
                  Nenhuma tarefa encontrada.
                </p>
              )}
            </div>
          </section>

          <section className="relatorios-secao">
            <h2>Relatório de plantios</h2>

            <div className="relatorios-tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Cultura</th>
                    <th>Canteiro</th>
                    <th>Data do Plantio</th>
                    <th>Peso Colhido</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {plantiosFiltrados.map((plantio) => (
                    <tr key={plantio.id_plantio}>
                      <td>{plantio.cultura || plantio.cultura_nome}</td>
                      <td>
                        {plantio.canteiro || plantio.canteiro_identificacao}
                      </td>
                      <td>{formatarData(plantio.data_plantio)}</td>
                      <td>
                        {plantio.peso_colhido !== null &&
                        plantio.peso_colhido !== undefined
                          ? `${plantio.peso_colhido} kg`
                          : '-'}
                      </td>
                      <td>{plantio.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {plantiosFiltrados.length === 0 && (
                <p className="relatorios-vazio">
                  Nenhum plantio encontrado.
                </p>
              )}
            </div>
          </section>

          <section className="relatorios-secao">
            <h2>Histórico de colheitas</h2>
            <div className="relatorios-tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Data do Plantio</th>
                    <th>Cultura</th>
                    <th>Canteiro</th>
                    <th>Quantidade Colhida</th>
                  </tr>
                </thead>
                <tbody>
                  {colheitasFiltradas.map((colheita) => (
                    <tr key={colheita.id_plantio}>
                      <td>{formatarData(colheita.data_plantio)}</td>
                      <td>{colheita.cultura || colheita.cultura_nome}</td>
                      <td>
                        {colheita.canteiro || colheita.canteiro_identificacao}
                      </td>
                      <td>{Number(colheita.peso_colhido || 0).toFixed(2)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {colheitasFiltradas.length === 0 && (
                <p className="relatorios-vazio">Nenhuma colheita encontrada no período.</p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Relatorios;
