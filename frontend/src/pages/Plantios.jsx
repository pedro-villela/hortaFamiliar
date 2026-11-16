import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import FormularioPlantio from '../components/FormularioPlantio';
import { requisicao } from '../services/api';
import './Culturas.css';
import './Plantios.css';

const formularioVazio = {
  culturaId: '',
  canteiroId: '',
  dataPlantio: '',
  status: 'CRESCIMENTO',
  pesoColhido: '',
  insumoId: '',
  quantidadeInsumo: ''
};

function calcularColheita(dataPlantio, dias) {
  const dataLimpa = dataPlantio ? String(dataPlantio).slice(0, 10) : '';
  if (!dataLimpa || !Number.isFinite(Number(dias))) {
    return '-';
  }

  const data = new Date(`${dataLimpa}T12:00:00`);
  data.setDate(data.getDate() + Number(dias));

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
  if (!data || data === '-') return '-';

  const dataLimpa = String(data).slice(0, 10);
  const [ano, mes, dia] = dataLimpa.split('-');
  return `${dia}/${mes}/${ano}`;
}

function Plantios() {
  const [culturas, setCulturas] = useState([]);
  const [canteiros, setCanteiros] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [plantios, setPlantios] = useState([]);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioVazio);

  async function carregarDados() {
    try {
      const [listaCulturas, listaCanteiros, listaInsumos, listaPlantios] =
        await Promise.all([
          requisicao('/api/culturas'),
          requisicao('/api/canteiros'),
          requisicao('/api/insumos'),
          requisicao('/api/plantios')
        ]);

      setCulturas(Array.isArray(listaCulturas) ? listaCulturas : []);
      setCanteiros(Array.isArray(listaCanteiros) ? listaCanteiros : []);
      setInsumos(Array.isArray(listaInsumos) ? listaInsumos : []);
      setPlantios(Array.isArray(listaPlantios) ? listaPlantios : []);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function novoPlantio() {
    setIdEditando(null);
    setFormulario({ ...formularioVazio });
    setFormularioAberto(true);
  }

  function editar(plantio) {
    setIdEditando(plantio.id_plantio);

    setFormulario({
      culturaId: String(plantio.id_cultura),
      canteiroId: String(plantio.id_canteiro),
      dataPlantio: String(plantio.data_plantio).slice(0, 10),
      status: plantio.status,
      pesoColhido: plantio.peso_colhido !== null && plantio.peso_colhido !== undefined
        ? String(plantio.peso_colhido)
        : '',
      insumoId: '',
      quantidadeInsumo: ''
    });

    setFormularioAberto(true);
  }

  async function salvar(evento) {
    evento.preventDefault();

    const payload = {
      id_cultura: Number(formulario.culturaId),
      id_canteiro: Number(formulario.canteiroId),
      data_plantio: formulario.dataPlantio,
      status: formulario.status,
      peso_colhido:
        formulario.pesoColhido !== '' ? Number(formulario.pesoColhido) : null
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
        await requisicao(`/api/plantios/${idEditando}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        const resposta = await requisicao('/api/plantios', {
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
    } catch (err) {
      alert(err.message);
    }
  }

  async function excluir(plantio) {
    if (!window.confirm('Deseja realmente excluir este plantio?')) return;
    try {
      await requisicao(`/api/plantios/${plantio.id_plantio}`, {
        method: 'DELETE'
      });
      await carregarDados();
    } catch (err) {
      alert(err.message);
    }
  }

  function obterCultura(id) {
    return culturas.find(
      (cultura) => String(cultura.id_cultura) === String(id)
    );
  }

  function obterCanteiro(id) {
    return canteiros.find(
      (canteiro) => String(canteiro.id_canteiro) === String(id)
    );
  }

  const filtrados = plantios.filter((plantio) => {
    const nomeCultura =
      plantio.cultura ||
      plantio.cultura_nome ||
      obterCultura(plantio.id_cultura)?.nome ||
      '';
    const nomeCanteiro =
      plantio.canteiro ||
      plantio.canteiro_identificacao ||
      obterCanteiro(plantio.id_canteiro)?.identificacao ||
      '';

    const correspondeBusca =
      nomeCultura.toLowerCase().includes(busca.toLowerCase()) ||
      nomeCanteiro.toLowerCase().includes(busca.toLowerCase());

    const correspondeStatus =
      filtroStatus === 'TODOS' || plantio.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Plantios</h1>
          <p>Registre e acompanhe os plantios da horta.</p>

          <div className="plantios-resumo">
            <div className="plantio-card">
              <span>Total de plantios</span>
              <strong>{plantios.length}</strong>
            </div>

            <div className="plantio-card">
              <span>Em crescimento</span>
              <strong>
                {plantios.filter(
                  (item) => item.status === 'CRESCIMENTO'
                ).length}
              </strong>
            </div>

            <div className="plantio-card">
              <span>Colhidos</span>
              <strong>
                {plantios.filter(
                  (item) => item.status === 'COLHIDO'
                ).length}
              </strong>
            </div>
          </div>

          <div className="plantios-acoes">
            <input
              type="search"
              placeholder="Buscar cultura ou canteiro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              aria-label="Filtrar plantios por status"
            >
              <option value="TODOS">Todos os status</option>
              <option value="CRESCIMENTO">Em crescimento</option>
              <option value="COLHIDO">Colhido</option>
              <option value="PERDIDO">Perdido</option>
            </select>

            <button className="botao-verde" onClick={novoPlantio}>
              + NOVO PLANTIO
            </button>
          </div>

          {formularioAberto && (
            <FormularioPlantio
              formulario={formulario}
              setFormulario={setFormulario}
              culturas={culturas}
              canteiros={canteiros}
              insumos={insumos}
              salvar={salvar}
              cancelar={() => setFormularioAberto(false)}
              editando={idEditando !== null}
            />
          )}

          <div className="tabela-culturas-container">
            <table className="tabela-culturas">
              <thead>
                <tr>
                  <th>Cultura</th>
                  <th>Canteiro</th>
                  <th>Data do plantio</th>
                  <th>Previsão de colheita</th>
                  <th>Peso colhido</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map((plantio) => {
                  const culturaObj = obterCultura(plantio.id_cultura);
                  const previsao = calcularColheita(
                    plantio.data_plantio,
                    culturaObj?.tempo_maturacao_dias
                  );

                  return (
                    <tr key={plantio.id_plantio}>
                      <td>
                        {plantio.cultura ||
                          plantio.cultura_nome ||
                          culturaObj?.nome ||
                          'Cultura não encontrada'}
                      </td>

                      <td>
                        {plantio.canteiro ||
                          plantio.canteiro_identificacao ||
                          obterCanteiro(plantio.id_canteiro)?.identificacao ||
                          'Canteiro não encontrado'}
                      </td>

                      <td>{formatarData(plantio.data_plantio)}</td>

                      <td>{formatarData(previsao)}</td>

                      <td>
                        {plantio.peso_colhido !== null &&
                        plantio.peso_colhido !== undefined
                          ? `${plantio.peso_colhido} kg`
                          : '-'}
                      </td>

                      <td>
                        <span
                          className={`status-plantio ${
                            plantio.status === 'COLHIDO'
                              ? 'concluido'
                              : plantio.status === 'CRESCIMENTO'
                              ? 'andamento'
                              : 'planejado'
                          }`}
                        >
                          {plantio.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="acao-tabela"
                          onClick={() => editar(plantio)}
                          aria-label="Editar plantio"
                        >
                          ✏️
                        </button>

                        <button
                          className="acao-tabela"
                          onClick={() => excluir(plantio)}
                          aria-label="Excluir plantio"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtrados.length === 0 && (
              <p className="lista-vazia">
                Nenhum plantio encontrado.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Plantios;
