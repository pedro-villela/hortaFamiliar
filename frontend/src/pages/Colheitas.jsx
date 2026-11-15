import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import { requisicao } from '../services/api';
import './Colheitas.css';

const formularioInicial = {
  plantioId: '',
  quantidade: ''
};

function formatarData(data) {
  if (!data) return '-';

  const [ano, mes, dia] = String(data).slice(0, 10).split('-');

  return `${dia}/${mes}/${ano}`;
}

function Colheitas() {
  const [plantios, setPlantios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [idEdicao, setIdEdicao] = useState(null);
  const [pesquisa, setPesquisa] = useState('');

  async function carregarPlantios() {
    try {
      const lista = await requisicao('/api/plantios');
      setPlantios(Array.isArray(lista) ? lista : []);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarPlantios();
  }, []);

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

  async function salvarColheita(evento) {
    evento.preventDefault();

    const plantioId = idEdicao || formulario.plantioId;
    const plantio = plantios.find(
      (p) => String(p.id_plantio) === String(plantioId)
    );
    const quantidade = Number(formulario.quantidade);

    if (!plantio) {
      alert('Selecione um plantio válido.');
      return;
    }

    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      alert('Informe um peso colhido (kg) maior que zero.');
      return;
    }

    try {
      await requisicao(`/api/plantios/${plantio.id_plantio}`, {
        method: 'PUT',
        body: JSON.stringify({
          id_cultura: plantio.id_cultura,
          id_canteiro: plantio.id_canteiro,
          data_plantio: String(plantio.data_plantio).slice(0, 10),
          status: 'COLHIDO',
          peso_colhido: quantidade
        })
      });

      await carregarPlantios();
      limparFormulario();
    } catch (err) {
      alert(err.message);
    }
  }

  function editarColheita(plantio) {
    setIdEdicao(plantio.id_plantio);

    setFormulario({
      plantioId: String(plantio.id_plantio),
      quantidade: String(plantio.peso_colhido || '')
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  async function removerColheita(plantio) {
    const nomeCultura = plantio.cultura || plantio.cultura_nome;
    const confirmar = window.confirm(
      `Deseja reverter a colheita de ${nomeCultura} para EM CRESCIMENTO?`
    );

    if (!confirmar) return;

    try {
      await requisicao(`/api/plantios/${plantio.id_plantio}`, {
        method: 'PUT',
        body: JSON.stringify({
          id_cultura: plantio.id_cultura,
          id_canteiro: plantio.id_canteiro,
          data_plantio: String(plantio.data_plantio).slice(0, 10),
          status: 'CRESCIMENTO',
          peso_colhido: null
        })
      });

      await carregarPlantios();
      if (idEdicao === plantio.id_plantio) {
        limparFormulario();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  const colheitas = plantios.filter((p) => p.status === 'COLHIDO');

  const colheitasFiltradas = colheitas.filter((colheita) => {
    const texto = pesquisa.toLowerCase();
    const culturaNome = colheita.cultura || colheita.cultura_nome || '';
    const canteiroNome =
      colheita.canteiro || colheita.canteiro_identificacao || '';

    return (
      culturaNome.toLowerCase().includes(texto) ||
      canteiroNome.toLowerCase().includes(texto)
    );
  });

  const totalColheitas = colheitas.length;

  const totalKg = colheitas.reduce(
    (soma, item) => soma + Number(item.peso_colhido || 0),
    0
  );

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard colheitas-pagina">
          <header className="colheitas-cabecalho">
            <h1>Colheitas e Produção</h1>
            <p>
              Registre a colheita dos plantios e acompanhe o peso colhido em kg.
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
              <span>Plantios em crescimento</span>
              <strong>
                {plantios.filter((p) => p.status === 'CRESCIMENTO').length}
              </strong>
            </article>
          </section>

          <section className="colheitas-formulario-card">
            <h2>
              {idEdicao
                ? 'Editar peso da colheita'
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
                    disabled={Boolean(idEdicao)}
                    required
                  >
                    <option value="">
                      Selecione um plantio
                    </option>

                    {plantios
                      .filter(
                        (plantio) =>
                          idEdicao
                            ? plantio.id_plantio === idEdicao
                            : plantio.status === 'CRESCIMENTO'
                      )
                      .map((plantio) => (
                        <option
                          key={plantio.id_plantio}
                          value={plantio.id_plantio}
                        >
                          {plantio.cultura || plantio.cultura_nome} —{' '}
                          {plantio.canteiro || plantio.canteiro_identificacao}{' '}
                          (Plantado em {formatarData(plantio.data_plantio)})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="colheita-quantidade">
                    Peso colhido (kg)
                  </label>

                  <input
                    id="colheita-quantidade"
                    type="number"
                    name="quantidade"
                    min="0.01"
                    step="0.01"
                    value={formulario.quantidade}
                    onChange={alterarCampo}
                    required
                  />
                </div>
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
                    <th>Data do Plantio</th>
                    <th>Peso Colhido</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {colheitasFiltradas.map((colheita) => (
                    <tr key={colheita.id_plantio}>
                      <td>{colheita.cultura || colheita.cultura_nome}</td>
                      <td>
                        {colheita.canteiro || colheita.canteiro_identificacao}
                      </td>
                      <td>{formatarData(colheita.data_plantio)}</td>
                      <td>{Number(colheita.peso_colhido || 0).toFixed(2)} kg</td>
                      <td>
                        <div className="colheitas-botoes-tabela">
                          <button
                            type="button"
                            onClick={() => editarColheita(colheita)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="colheitas-excluir"
                            onClick={() => removerColheita(colheita)}
                          >
                            Reverter
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
