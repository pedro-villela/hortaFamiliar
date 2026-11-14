
import { useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import './Relatorios.css';

const membrosPadrao = [
  { id: 1, nome: 'Ana Silva' },
  { id: 2, nome: 'Carlos Souza' },
  { id: 3, nome: 'Mariana Costa' }
];

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
    tarefas: lerDados('horta_tarefas'),
    movimentacoes: lerDados('horta_movimentacoes'),
    plantios: lerDados('horta_plantios'),
    canteiros: lerDados('horta_canteiros'),
    culturas: lerDados('horta_culturas'),
    colheitas: lerDados('horta_colheitas')
  };
}

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

function obterNome(lista, id) {
  return lista.find(
    (item) => String(item.id) === String(id)
  )?.nome || 'Não encontrado';
}

function Relatorios() {
  const [dados, setDados] = useState(carregarDados);
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  const {
    tarefas,
    movimentacoes,
    plantios,
    canteiros,
    culturas,
    colheitas
  } = dados;

  // Para tarefas, o período considera a data agendada.
  const tarefasFiltradas = tarefas.filter(
    (tarefa) =>
      dentroDoPeriodo(
        tarefa.data,
        dataInicial,
        dataFinal
      )
  );

  // Para movimentações, considera a data do registro.
  const movimentacoesFiltradas = movimentacoes.filter(
    (movimentacao) =>
      dentroDoPeriodo(
        movimentacao.data,
        dataInicial,
        dataFinal
      )
  );

  // Para plantios, considera a data do plantio.
  const plantiosFiltrados = plantios.filter(
    (plantio) =>
      dentroDoPeriodo(
        plantio.dataPlantio,
        dataInicial,
        dataFinal
      )
  );

  // As colheitas usam a data real da colheita, não a data do plantio.
  const colheitasFiltradas = colheitas.filter((colheita) =>
    dentroDoPeriodo(colheita.dataColheita, dataInicial, dataFinal)
  );

  const totalColheitas = colheitasFiltradas.length;

  const totalKg = colheitasFiltradas
    .filter((colheita) => colheita.unidade === 'kg')
    .reduce((soma, colheita) => soma + (Number(colheita.quantidade) || 0), 0);

  const totalUnidades = colheitasFiltradas
    .filter((colheita) => colheita.unidade === 'un')
    .reduce((soma, colheita) => soma + (Number(colheita.quantidade) || 0), 0);

  // Agrupamento por ID da cultura e unidade de medida.
  const producaoPorCultura = Object.values(
    colheitasFiltradas.reduce((acumulador, colheita) => {
      const chave = `${colheita.culturaId}-${colheita.unidade}`;

      if (!acumulador[chave]) {
        acumulador[chave] = {
          chave,
          cultura: colheita.culturaNome || obterNome(culturas, colheita.culturaId),
          unidade: colheita.unidade,
          quantidade: 0,
          colheitas: 0
        };
      }

      acumulador[chave].quantidade += Number(colheita.quantidade) || 0;
      acumulador[chave].colheitas += 1;
      return acumulador;
    }, {})
  );

  const tarefasConcluidas = tarefasFiltradas.filter(
    (tarefa) => tarefa.status === 'CONCLUÍDA'
  ).length;

  const tarefasPendentes = tarefasFiltradas.filter(
    (tarefa) => tarefa.status === 'PENDENTE'
  ).length;

  const tarefasEmAndamento = tarefasFiltradas.filter(
    (tarefa) => tarefa.status === 'EM ANDAMENTO'
  ).length;

  const totalTarefas = tarefasFiltradas.length;

  const percentualConcluidas = totalTarefas
    ? (tarefasConcluidas / totalTarefas) * 100
    : 0;

  const percentualPendentes = totalTarefas
    ? (tarefasPendentes / totalTarefas) * 100
    : 0;

  const percentualEmAndamento = totalTarefas
    ? (tarefasEmAndamento / totalTarefas) * 100
    : 0;

  function atualizarRelatorio() {
    if (
      dataInicial &&
      dataFinal &&
      dataInicial > dataFinal
    ) {
      alert('A data inicial não pode ser maior que a final.');
      return;
    }

    setDados(carregarDados());
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
              Acompanhe atividades, plantios, movimentações
              e a produção da horta.
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
              Atualizar dados
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
              <span>Movimentações</span>
              <strong>{movimentacoesFiltradas.length}</strong>
            </article>

            <article>
              <span>Plantios registrados</span>
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
              <span>Produção em unidades</span>
              <strong>{totalUnidades} un</strong>
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
                  nome: 'Em andamento',
                  valor: tarefasEmAndamento,
                  percentual: percentualEmAndamento,
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
            <h2>Relatório de tarefas</h2>

            <div className="relatorios-tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Tarefa</th>
                    <th>Responsável</th>
                    <th>Canteiro</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tarefasFiltradas.map((tarefa) => (
                    <tr key={tarefa.id}>
                      <td>{tarefa.titulo}</td>
                      <td>
                        {obterNome(
                          membrosPadrao,
                          tarefa.responsavelId
                        )}
                      </td>
                      <td>
                        {obterNome(
                          canteiros,
                          tarefa.canteiroId
                        )}
                      </td>
                      <td>{formatarData(tarefa.data)}</td>
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
                    <th>Plantio</th>
                    <th>Previsão de colheita</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {plantiosFiltrados.map((plantio) => (
                    <tr key={plantio.id}>
                      <td>
                        {obterNome(
                          culturas,
                          plantio.culturaId
                        )}
                      </td>
                      <td>
                        {obterNome(
                          canteiros,
                          plantio.canteiroId
                        )}
                      </td>
                      <td>
                        {formatarData(plantio.dataPlantio)}
                      </td>
                      <td>
                        {formatarData(
                          plantio.previsaoColheita
                        )}
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
            <h2>Relatório de movimentações de estoque</h2>

            <div className="relatorios-tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Insumo</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Origem</th>
                    <th>Observação</th>
                  </tr>
                </thead>

                <tbody>
                  {movimentacoesFiltradas.map((mov) => (
                    <tr key={mov.id}>
                      <td>{formatarData(mov.data)}</td>
                      <td>{mov.insumoNome}</td>
                      <td>{mov.tipo}</td>
                      <td>
                        {mov.quantidade} {mov.unidade}
                      </td>
                      <td>{mov.origem || 'MANUAL'}</td>
                      <td>{mov.observacao || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {movimentacoesFiltradas.length === 0 && (
                <p className="relatorios-vazio">
                  Nenhuma movimentação encontrada.
                </p>
              )}
            </div>
          </section>

          <section className="relatorios-secao">
            <h2>Produção por cultura</h2>
            <div className="relatorios-tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Cultura</th>
                    <th>Quantidade produzida</th>
                    <th>Número de colheitas</th>
                  </tr>
                </thead>
                <tbody>
                  {producaoPorCultura.map((item) => (
                    <tr key={item.chave}>
                      <td>{item.cultura}</td>
                      <td>{item.quantidade.toFixed(2)} {item.unidade}</td>
                      <td>{item.colheitas}</td>
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
            <h2>Histórico de colheitas</h2>
            <div className="relatorios-tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cultura</th>
                    <th>Canteiro</th>
                    <th>Quantidade</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {colheitasFiltradas.map((colheita) => (
                    <tr key={colheita.id}>
                      <td>{formatarData(colheita.dataColheita)}</td>
                      <td>{colheita.culturaNome || obterNome(culturas, colheita.culturaId)}</td>
                      <td>{colheita.canteiroNome || obterNome(canteiros, colheita.canteiroId)}</td>
                      <td>{colheita.quantidade} {colheita.unidade}</td>
                      <td>{colheita.observacoes || '-'}</td>
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
