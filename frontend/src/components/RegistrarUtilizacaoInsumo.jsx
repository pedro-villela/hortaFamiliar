
import { useState } from 'react';
import './RegistrarUtilizacaoInsumo.css';

function RegistrarUtilizacaoInsumo({
  tarefa,
  insumo,
  voltar,
  confirmar
}) {
  const [quantidade, setQuantidade] = useState(
    String(tarefa?.quantidadeInsumo ?? '')
  );

  const [observacao, setObservacao] = useState('');

  function registrar(evento) {
    evento.preventDefault();

    const quantidadeNumerica = Number(quantidade);

    if (
      quantidade.trim() === '' ||
      !Number.isFinite(quantidadeNumerica) ||
      quantidadeNumerica <= 0
    ) {
      alert('Informe uma quantidade maior que zero.');
      return;
    }

    if (quantidadeNumerica > Number(insumo.quantidade)) {
      alert(
        `Estoque insuficiente. Disponível: ` +
        `${insumo.quantidade} ${insumo.unidade}.`
      );
      return;
    }

    confirmar({
      quantidade: quantidadeNumerica,
      observacao: observacao.trim()
    });
  }

  return (
    <section className="registro-utilizacao">
      <h2>Registrar Utilização de Insumo</h2>

      <p>
        Informe a quantidade de material utilizada
        durante a execução da tarefa.
      </p>

      <div className="registro-utilizacao-cartao">
        <h3>Informações da tarefa</h3>

        <p>
          <strong>Tarefa:</strong> {tarefa.titulo}
        </p>

        <p>
          <strong>Insumo:</strong> {insumo.nome}
        </p>

        <p>
          <strong>Quantidade prevista:</strong>{' '}
          {tarefa.quantidadeInsumo} {insumo.unidade}
        </p>

        <p>
          <strong>Estoque disponível:</strong>{' '}
          {insumo.quantidade} {insumo.unidade}
        </p>

        <form onSubmit={registrar}>
          <label htmlFor="quantidade-utilizada">
            Quantidade realmente utilizada
          </label>

          <input
            id="quantidade-utilizada"
            type="number"
            min="0.0001"
            step="any"
            value={quantidade}
            onChange={(evento) =>
              setQuantidade(evento.target.value)
            }
            required
          />

          <label htmlFor="observacao-utilizacao">
            Observação
          </label>

          <textarea
            id="observacao-utilizacao"
            value={observacao}
            onChange={(evento) =>
              setObservacao(evento.target.value)
            }
            placeholder="Ex.: Utilizado no preparo do Canteiro A"
            rows="4"
          />

          <div className="registro-utilizacao-botoes">
            <button
              type="button"
              className="registro-utilizacao-voltar"
              onClick={voltar}
            >
              VOLTAR
            </button>

            <button
              type="submit"
              className="registro-utilizacao-confirmar"
            >
              CONFIRMAR UTILIZAÇÃO
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default RegistrarUtilizacaoInsumo;
