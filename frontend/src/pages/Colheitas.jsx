
import { useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import './Colheitas.css';

const formularioInicial = {
  plantioId: '',
  dataColheita: '',
  quantidade: '',
  unidade: 'kg',
  observacoes: ''
};

function lerDados(chave) {
  try {
    const salvo = localStorage.getItem(chave);
    const resultado = salvo ? JSON.parse(salvo) : [];

    return Array.isArray(resultado) ? resultado : [];
  } catch {
    return [];
  }
}

function formatarData(data) {
  if (!data) return '-';

  const [ano, mes, dia] = String(data).slice(0, 10).split('-');

  return `${dia}/${mes}/${ano}`;
}

function obterNome(lista, id) {
  return lista.find(
    (item) => String(item.id) === String(id)
  )?.nome || 'Não encontrado';
}

function Colheitas() {
  const [plantios] = useState(() =>
    lerDados('horta_plantios')
  );

  const [culturas] = useState(() =>
    lerDados('horta_culturas')
  );

  const [canteiros] = useState(() =>
    lerDados('horta_canteiros')
  );

  const [colheitas, setColheitas] = useState(() =>
    lerDados('horta_colheitas')
  );

  const [formulario, setFormulario] = useState(formularioInicial);
  const [idEdicao, setIdEdicao] = useState(null);
  const [pesquisa, setPesquisa] = useState('');

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }

  function limparFormulario() {
    setFormulario(formularioInicial);
    setIdEdicao(null);
  }

  function salvarColheita(evento) {
    evento.preventDefault();

    const plantio = plantios.find(
      (item) =>
        String(item.id) === String(formulario.plantioId)
    );

    if (!plantio) {
      alert('Selecione um plantio válido.');
      return;
    }

    if (plantio.status === 'PLANEJADO') {
      alert(
        'Não é possível registrar colheita de um plantio planejado.'
      );
      return;
    }

    const quantidade = Number(formulario.quantidade);

    if (
      formulario.quantidade.trim() === '' ||
      !Number.isFinite(quantidade) ||
      quantidade <= 0
    ) {
      alert('Informe uma quantidade maior que zero.');
      return;
    }

    if (!formulario.dataColheita) {
      alert('Informe a data da colheita.');
      return;
    }

    if (formulario.dataColheita < plantio.dataPlantio) {
      alert(
        'A colheita não pode acontecer antes da data do plantio.'
      );
      return;
    }

    const hoje = new Date();
    const dataLocal = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      String(hoje.getDate()).padStart(2, '0')
    ].join('-');

    if (formulario.dataColheita > dataLocal) {
      alert('A data da colheita não pode estar no futuro.');
      return;
    }

    const culturaNome = obterNome(
      culturas,
      plantio.culturaId
    );

    const canteiroNome = obterNome(
      canteiros,
      plantio.canteiroId
    );

    const registro = {
      id: idEdicao || crypto.randomUUID(),
      plantioId: plantio.id,
      culturaId: plantio.culturaId,
      canteiroId: plantio.canteiroId,
      culturaNome,
      canteiroNome,
      dataColheita: formulario.dataColheita,
      quantidade,
      unidade: formulario.unidade,
      observacoes: formulario.observacoes.trim()
    };

    let listaAtualizada;

    if (idEdicao) {
      listaAtualizada = colheitas.map((item) =>
        item.id === idEdicao ? registro : item
      );
    } else {
      listaAtualizada = [registro, ...colheitas];
    }

    localStorage.setItem(
      'horta_colheitas',
      JSON.stringify(listaAtualizada)
    );

    setColheitas(listaAtualizada);
    limparFormulario();

    alert(
      idEdicao
        ? 'Colheita atualizada com sucesso!'
        : 'Colheita registrada com sucesso!'
    );
  }

  function editarColheita(colheita) {
    setIdEdicao(colheita.id);

    setFormulario({
      plantioId: String(colheita.plantioId),
      dataColheita: colheita.dataColheita,
      quantidade: String(colheita.quantidade),
      unidade: colheita.unidade,
      observacoes: colheita.observacoes || ''
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function excluirColheita(colheita) {
    const confirmar = window.confirm(
      `Deseja excluir a colheita de ${colheita.culturaNome}?`
    );

    if (!confirmar) return;

    const listaAtualizada = colheitas.filter(
      (item) => item.id !== colheita.id
    );

    localStorage.setItem(
      'horta_colheitas',
      JSON.stringify(listaAtualizada)
    );

    setColheitas(listaAtualizada);

    if (idEdicao === colheita.id) {
      limparFormulario();
    }
  }

  const colheitasFiltradas = colheitas.filter((colheita) => {
    const texto = pesquisa.toLowerCase();

    return (
      colheita.culturaNome.toLowerCase().includes(texto) ||
      colheita.canteiroNome.toLowerCase().includes(texto)
    );
  });

  const totalColheitas = colheitas.length;

  // Soma somente colheitas registradas em quilogramas.
  const totalKg = colheitas
    .filter((item) => item.unidade === 'kg')
    .reduce(
      (soma, item) => soma + Number(item.quantidade),
      0
    );

  // Soma somente colheitas registradas em unidades.
  const totalUnidades = colheitas
    .filter((item) => item.unidade === 'un')
    .reduce(
      (soma, item) => soma + Number(item.quantidade),
      0
    );

  const plantiosComColheita = new Set(
    colheitas.map((item) => String(item.plantioId))
  ).size;

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard colheitas-pagina">
          <header className="colheitas-cabecalho">
            <h1>Colheitas e Produção</h1>
            <p>
              Registre e acompanhe a produção da horta.
            </p>
          </header>

          <section className="colheitas-indicadores">
            <article>
              <span>Colheitas registradas</span>
              <strong>{totalColheitas}</strong>
            </article>

            <article>
              <span>Produção em kg</span>
              <strong>{totalKg.toFixed(2)} kg</strong>
            </article>

            <article>
              <span>Produção em unidades</span>
              <strong>{totalUnidades} un</strong>
            </article>

            <article>
              <span>Plantios com colheita</span>
              <strong>{plantiosComColheita}</strong>
            </article>
          </section>

          <section className="colheitas-formulario-card">
            <h2>
              {idEdicao
                ? 'Editar colheita'
                : 'Registrar nova colheita'}
            </h2>

            <form onSubmit={salvarColheita}>
              <div className="colheitas-formulario-grid">
                <div>
                  <label htmlFor="colheita-plantio">
                    Plantio
                  </label>

                  <select
                    id="colheita-plantio"
                    name="plantioId"
                    value={formulario.plantioId}
                    onChange={alterarCampo}
                    required
                  >
                    <option value="">
                      Selecione um plantio
                    </option>

                    {plantios
                      .filter(
                        (plantio) =>
                          plantio.status !== 'PLANEJADO'
                      )
                      .map((plantio) => (
                        <option
                          key={plantio.id}
                          value={plantio.id}
                        >
                          {obterNome(
                            culturas,
                            plantio.culturaId
                          )} — {obterNome(
                            canteiros,
                            plantio.canteiroId
                          )}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="colheita-data">
                    Data da colheita
                  </label>

                  <input
                    id="colheita-data"
                    type="date"
                    name="dataColheita"
                    value={formulario.dataColheita}
                    onChange={alterarCampo}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="colheita-quantidade">
                    Quantidade colhida
                  </label>

                  <input
                    id="colheita-quantidade"
                    type="number"
                    name="quantidade"
                    min="0.01"
                    step="any"
                    value={formulario.quantidade}
                    onChange={alterarCampo}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="colheita-unidade">
                    Unidade
                  </label>

                  <select
                    id="colheita-unidade"
                    name="unidade"
                    value={formulario.unidade}
                    onChange={alterarCampo}
                  >
                    <option value="kg">Quilogramas (kg)</option>
                    <option value="un">Unidades (un)</option>
                  </select>
                </div>
              </div>

              <div className="colheitas-observacoes">
                <label htmlFor="colheita-observacoes">
                  Observações
                </label>

                <textarea
                  id="colheita-observacoes"
                  name="observacoes"
                  rows="3"
                  value={formulario.observacoes}
                  onChange={alterarCampo}
                  placeholder="Ex.: Colheita parcial, boa qualidade."
                />
              </div>

              <div className="colheitas-acoes">
                <button
                  type="submit"
                  className="botao-verde"
                >
                  {idEdicao
                    ? 'SALVAR ALTERAÇÕES'
                    : 'REGISTRAR COLHEITA'}
                </button>

                {idEdicao && (
                  <button
                    type="button"
                    className="colheitas-botao-cancelar"
                    onClick={limparFormulario}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="colheitas-listagem">
            <div className="colheitas-listagem-topo">
              <h2>Histórico de colheitas</h2>

              <input
                type="search"
                placeholder="Pesquisar cultura ou canteiro..."
                value={pesquisa}
                onChange={(evento) =>
                  setPesquisa(evento.target.value)
                }
              />
            </div>

            <div className="colheitas-tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Cultura</th>
                    <th>Canteiro</th>
                    <th>Data</th>
                    <th>Quantidade</th>
                    <th>Observações</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {colheitasFiltradas.map((colheita) => (
                    <tr key={colheita.id}>
                      <td>{colheita.culturaNome}</td>
                      <td>{colheita.canteiroNome}</td>
                      <td>
                        {formatarData(
                          colheita.dataColheita
                        )}
                      </td>
                      <td>
                        {colheita.quantidade}{' '}
                        {colheita.unidade}
                      </td>
                      <td>
                        {colheita.observacoes || '-'}
                      </td>
                      <td>
                        <div className="colheitas-botoes-tabela">
                          <button
                            type="button"
                            onClick={() =>
                              editarColheita(colheita)
                            }
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="colheitas-excluir"
                            onClick={() =>
                              excluirColheita(colheita)
                            }
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {colheitasFiltradas.length === 0 && (
                <p className="colheitas-vazio">
                  Nenhuma colheita encontrada.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Colheitas;
