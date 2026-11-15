import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import { requisicao } from '../services/api';
import './Producao.css';

function Producao() {
  const [dados, setDados] = useState({
    resumo: {
      total_plantios: 0,
      produtividade_total_kg: 0
    },
    produtividadePorCulturaECanteiro: []
  });

  useEffect(() => {
    async function carregarProducao() {
      try {
        const resposta = await requisicao(
          '/api/dashboard/producao?data_inicio=2000-01-01&data_fim=2099-12-31'
        );
        if (resposta) {
          setDados(resposta);
        }
      } catch (err) {
        alert(err.message);
      }
    }
    carregarProducao();
  }, []);

  const totalColheitas = Number(
    dados.resumo?.total_plantios ??
      dados.resumo_geral?.total_plantios_colhidos ??
      0
  );
  const totalKg = Number(
    dados.resumo?.produtividade_total_kg ??
      dados.resumo_geral?.peso_total_colhido_kg ??
      0
  );
  const linhas = dados.produtividadePorCulturaECanteiro || [];

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard producao-pagina">
          <h1>Produção da Horta</h1>

          <p>
            Acompanhe os resultados consolidados das colheitas registradas no banco de dados.
          </p>

          <section className="producao-indicadores">
            <article>
              <span>Colheitas realizadas</span>
              <strong>{totalColheitas}</strong>
            </article>

            <article>
              <span>Produção total em kg</span>
              <strong>{totalKg.toFixed(2)} kg</strong>
            </article>

            <article>
              <span>Registros por cultura e canteiro</span>
              <strong>{linhas.length}</strong>
            </article>
          </section>

          <section className="producao-tabela-card">
            <h2>Produtividade por Cultura e Canteiro</h2>

            <div className="producao-tabela-container">
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
                  {linhas.map((item) => (
                    <tr key={`${item.id_cultura}-${item.id_canteiro}`}>
                      <td>{item.cultura}</td>
                      <td>{item.canteiro}</td>
                      <td>
                        {Number(item.produtividade_total_kg).toFixed(2)} kg
                      </td>
                      <td>
                        {Number(item.produtividade_media_kg).toFixed(2)} kg
                      </td>
                      <td>{item.total_plantios}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {linhas.length === 0 && (
                <p className="producao-vazio">
                  Nenhuma produção registrada.
                  Cadastre uma colheita para visualizar os dados.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Producao;
