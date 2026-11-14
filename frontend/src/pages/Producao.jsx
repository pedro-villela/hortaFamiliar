
import { useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import './Producao.css';

function lerDados(chave) {
  try {
    const dados = localStorage.getItem(chave);
    const resultado = dados ? JSON.parse(dados) : [];
    return Array.isArray(resultado) ? resultado : [];
  } catch {
    return [];
  }
}

function Producao() {
  const [colheitas] = useState(() =>
    lerDados('horta_colheitas')
  );

  const totalColheitas = colheitas.length;

  const totalKg = colheitas
    .filter((item) => item.unidade === 'kg')
    .reduce(
      (soma, item) => soma + Number(item.quantidade),
      0
    );

  const totalUnidades = colheitas
    .filter((item) => item.unidade === 'un')
    .reduce(
      (soma, item) => soma + Number(item.quantidade),
      0
    );

  const producaoPorCultura = Object.values(
    colheitas.reduce((acumulador, colheita) => {
      const chave = `${colheita.culturaId}-${colheita.unidade}`;

      if (!acumulador[chave]) {
        acumulador[chave] = {
          cultura: colheita.culturaNome,
          unidade: colheita.unidade,
          quantidade: 0,
          colheitas: 0
        };
      }

      acumulador[chave].quantidade += Number(
        colheita.quantidade
      );

      acumulador[chave].colheitas += 1;

      return acumulador;
    }, {})
  );

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard producao-pagina">
          <h1>Produção da Horta</h1>

          <p>
            Acompanhe os resultados das colheitas registradas.
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
              <span>Produção em unidades</span>
              <strong>{totalUnidades} un</strong>
            </article>
          </section>

          <section className="producao-tabela-card">
            <h2>Produção por cultura</h2>

            <div className="producao-tabela-container">
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
                    <tr
                      key={`${item.cultura}-${item.unidade}`}
                    >
                      <td>{item.cultura}</td>
                      <td>
                        {item.quantidade.toFixed(2)}{' '}
                        {item.unidade}
                      </td>
                      <td>{item.colheitas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {producaoPorCultura.length === 0 && (
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
