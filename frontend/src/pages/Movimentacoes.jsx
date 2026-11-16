import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import { requisicao } from '../services/api';
import './Movimentacoes.css';

const formularioInicial = {
  insumoId: '',
  tipo: 'ENTRADA',
  quantidade: '',
  observacao: ''
};

function lerHistorico() {
  try {
    const dados = localStorage.getItem('horta_movimentacoes');
    return dados ? JSON.parse(dados) : [];
  } catch {
    return [];
  }
}

function Movimentacoes() {
  const [insumos, setInsumos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState(lerHistorico);
  const [formulario, setFormulario] = useState(formularioInicial);

  async function carregarInsumos() {
    try {
      const lista = await requisicao('/api/insumos');
      setInsumos(Array.isArray(lista) ? lista : []);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    carregarInsumos();
  }, []);

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }

  async function registrarMovimentacao(evento) {
    evento.preventDefault();

    const insumoAtual = insumos.find(
      (item) => String(item.id_insumo) === String(formulario.insumoId)
    );

    const quantidade = Number(formulario.quantidade);

    if (!insumoAtual) {
      alert('Selecione um insumo válido.');
      return;
    }

    if (
      formulario.quantidade.trim() === '' ||
      !Number.isFinite(quantidade) ||
      quantidade <= 0
    ) {
      alert('A quantidade deve ser maior que zero.');
      return;
    }

    const saldoAnterior = Number(insumoAtual.quantidade_estoque);

    if (formulario.tipo === 'SAÍDA' && quantidade > saldoAnterior) {
      alert(`Estoque insuficiente! Disponível: ${saldoAnterior}.`);
      return;
    }

    const saldoNovo = Number(
      (
        formulario.tipo === 'ENTRADA'
          ? saldoAnterior + quantidade
          : saldoAnterior - quantidade
      ).toFixed(2)
    );

    try {
      await requisicao(`/api/insumos/${insumoAtual.id_insumo}`, {
        method: 'PUT',
        body: JSON.stringify({
          quantidade_estoque: saldoNovo
        })
      });

      const novaMovimentacao = {
        id: crypto.randomUUID(),
        insumoId: insumoAtual.id_insumo,
        insumoNome: insumoAtual.nome,
        tipo: formulario.tipo,
        quantidade,
        saldoAnterior,
        saldoNovo,
        observacao: formulario.observacao.trim(),
        data: new Date().toISOString(),
        origem: 'MANUAL'
      };

      const novoHistorico = [novaMovimentacao, ...movimentacoes];
      localStorage.setItem(
        'horta_movimentacoes',
        JSON.stringify(novoHistorico)
      );

      setMovimentacoes(novoHistorico);
      setFormulario({ ...formularioInicial });
      await carregarInsumos();
    } catch (err) {
      alert(err.message);
    }
  }

  async function estornarMovimentacao(movimentacao) {
    const insumo = insumos.find(
      (item) => String(item.id_insumo) === String(movimentacao.insumoId)
    );

    if (!insumo) {
      alert('Insumo não encontrado.');
      return;
    }

    const quantidade = Number(movimentacao.quantidade);
    const saldoAnterior = Number(insumo.quantidade_estoque);
    const tipoEstorno =
      movimentacao.tipo === 'ENTRADA' ? 'SAÍDA' : 'ENTRADA';

    if (tipoEstorno === 'SAÍDA' && quantidade > saldoAnterior) {
      alert(
        'Não é possível estornar esta entrada, pois o estoque atual é insuficiente.'
      );
      return;
    }

    const justificativa = window.prompt('Informe o motivo do estorno:');
    if (justificativa === null) return;
    if (!justificativa.trim()) {
      alert('A justificativa é obrigatória.');
      return;
    }

    const saldoNovo = Number(
      (
        tipoEstorno === 'ENTRADA'
          ? saldoAnterior + quantidade
          : saldoAnterior - quantidade
      ).toFixed(2)
    );

    try {
      await requisicao(`/api/insumos/${insumo.id_insumo}`, {
        method: 'PUT',
        body: JSON.stringify({
          quantidade_estoque: saldoNovo
        })
      });

      const estorno = {
        id: crypto.randomUUID(),
        insumoId: insumo.id_insumo,
        insumoNome: insumo.nome,
        tipo: tipoEstorno,
        quantidade,
        saldoAnterior,
        saldoNovo,
        observacao: `ESTORNO: ${justificativa.trim()}`,
        data: new Date().toISOString(),
        origem: 'ESTORNO',
        movimentacaoOriginalId: movimentacao.id
      };

      const novoHistorico = [estorno, ...movimentacoes];
      localStorage.setItem(
        'horta_movimentacoes',
        JSON.stringify(novoHistorico)
      );

      setMovimentacoes(novoHistorico);
      await carregarInsumos();
    } catch (err) {
      alert(err.message);
    }
  }

  function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR');
  }

  return (
    <div className="layout-admin">
      <MenuLateral />

      <div className="area-principal">
        <BarraSuperior />

        <main className="conteudo-dashboard">
          <h1>Movimentações de Estoque</h1>
          <p>
            Registre entradas e saídas manuais de materiais da horta.
          </p>

          <div className="movimentacoes-painel">
            <form
              className="movimentacoes-formulario"
              onSubmit={registrarMovimentacao}
            >
              <h2>Nova movimentação</h2>

              <label htmlFor="mov-insumo">Insumo</label>
              <select
                id="mov-insumo"
                name="insumoId"
                value={formulario.insumoId}
                onChange={alterarCampo}
                required
              >
                <option value="">Selecione um insumo</option>

                {insumos.map((insumo) => (
                  <option
                    key={insumo.id_insumo}
                    value={insumo.id_insumo}
                  >
                    {insumo.nome} [{insumo.tipo}] — Saldo: {insumo.quantidade_estoque}
                  </option>
                ))}
              </select>

              <label htmlFor="mov-tipo">Tipo</label>
              <select
                id="mov-tipo"
                name="tipo"
                value={formulario.tipo}
                onChange={alterarCampo}
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SAÍDA">Saída</option>
              </select>

              <label htmlFor="mov-quantidade">
                Quantidade
              </label>
              <input
                id="mov-quantidade"
                name="quantidade"
                type="number"
                min="0.01"
                step="0.01"
                value={formulario.quantidade}
                onChange={alterarCampo}
                required
              />

              <label htmlFor="mov-observacao">
                Observação
              </label>
              <textarea
                id="mov-observacao"
                name="observacao"
                value={formulario.observacao}
                onChange={alterarCampo}
                placeholder="Ex.: Reposição de sementes"
                rows="3"
              />

              <button
                className="botao-verde"
                type="submit"
              >
                REGISTRAR MOVIMENTAÇÃO
              </button>
            </form>

            <section className="movimentacoes-saldos">
              <h2>Estoque atual (Banco de Dados)</h2>

              {insumos.map((insumo) => {
                const estoqueBaixo =
                  insumo.abaixo_do_minimo ||
                  Number(insumo.quantidade_estoque) <=
                    Number(insumo.estoque_minimo);

                return (
                  <div
                    className="movimentacoes-saldo"
                    key={insumo.id_insumo}
                  >
                    <div>
                      <strong>{insumo.nome}</strong>
                      <span>
                        Mínimo: {insumo.estoque_minimo}
                      </span>
                    </div>

                    <div>
                      <strong>{insumo.quantidade_estoque}</strong>

                      {estoqueBaixo && (
                        <span className="movimentacoes-alerta">
                          Estoque baixo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          <section className="movimentacoes-historico">
            <h2>Histórico de movimentações</h2>

            <div className="movimentacoes-tabela-container">
              <table className="movimentacoes-tabela">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Insumo</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Saldo anterior</th>
                    <th>Saldo final</th>
                    <th>Observação</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {movimentacoes.map((mov) => (
                    <tr key={mov.id}>
                      <td>{formatarData(mov.data)}</td>
                      <td>{mov.insumoNome}</td>

                      <td>
                        <span
                          className={
                            mov.tipo === 'ENTRADA'
                              ? 'mov-tipo-entrada'
                              : 'mov-tipo-saida'
                          }
                        >
                          {mov.tipo}
                        </span>
                      </td>

                      <td>{mov.quantidade}</td>
                      <td>{mov.saldoAnterior}</td>
                      <td>{mov.saldoNovo}</td>
                      <td>{mov.observacao || '-'}</td>

                      <td>
                        {mov.origem !== 'ESTORNO' &&
                        !movimentacoes.some(
                          (item) =>
                            item.origem === 'ESTORNO' &&
                            item.movimentacaoOriginalId === mov.id
                        ) ? (
                          <button
                            type="button"
                            className="botao-estornar"
                            onClick={() => estornarMovimentacao(mov)}
                          >
                            Estornar
                          </button>
                        ) : (
                          <span>
                            {mov.origem === 'ESTORNO'
                              ? 'Estorno registrado'
                              : 'Estornada'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {movimentacoes.length === 0 && (
                <p className="movimentacoes-vazio">
                  Nenhuma movimentação registrada.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Movimentacoes;
