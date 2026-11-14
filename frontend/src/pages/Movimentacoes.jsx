
import { useState } from 'react';
import MenuLateral from '../components/MenuLateral';
import BarraSuperior from '../components/BarraSuperior';
import './Movimentacoes.css';

const insumosIniciais = [
  {
    id: 1,
    nome: 'Semente de alface',
    categoria: 'Sementes',
    quantidade: 300,
    unidade: 'g',
    estoqueMinimo: 100
  },
  {
    id: 2,
    nome: 'Adubo orgânico',
    categoria: 'Fertilizantes',
    quantidade: 10,
    unidade: 'kg',
    estoqueMinimo: 5
  },
  {
    id: 3,
    nome: 'Fertilizante NPK',
    categoria: 'Fertilizantes',
    quantidade: 2,
    unidade: 'kg',
    estoqueMinimo: 3
  },
  {
    id: 4,
    nome: 'Enxada',
    categoria: 'Ferramentas',
    quantidade: 3,
    unidade: 'un',
    estoqueMinimo: 2
  }
];

const formularioInicial = {
  insumoId: '',
  tipo: 'ENTRADA',
  quantidade: '',
  observacao: ''
};

function lerDados(chave, padrao) {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : padrao;
  } catch {
    return padrao;
  }
}

function Movimentacoes() {
  const [insumos, setInsumos] = useState(() =>
    lerDados('horta_insumos', insumosIniciais)
  );

  const [movimentacoes, setMovimentacoes] = useState(() =>
    lerDados('horta_movimentacoes', [])
  );

  const [formulario, setFormulario] = useState(formularioInicial);

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }

  function registrarMovimentacao(evento) {
    evento.preventDefault();

    const insumo = insumos.find(
      (item) => String(item.id) === formulario.insumoId
    );

    const quantidade = Number(formulario.quantidade);

    if (!insumo) {
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

    if (
      formulario.tipo !== 'ENTRADA' &&
      formulario.tipo !== 'SAÍDA'
    ) {
      alert('Selecione um tipo de movimentação válido.');
      return;
    }

    // Consulta novamente os dados salvos antes de alterar o estoque.
    const estoqueAtual = lerDados(
      'horta_insumos',
      insumosIniciais
    );

    const insumoAtual = estoqueAtual.find(
      (item) => String(item.id) === formulario.insumoId
    );

    if (!insumoAtual) {
      alert('Este insumo não está mais cadastrado.');
      setInsumos(estoqueAtual);
      return;
    }

    const saldoAnterior = Number(insumoAtual.quantidade);

    if (!Number.isFinite(saldoAnterior) || saldoAnterior < 0) {
      alert('O saldo atual do insumo é inválido.');
      return;
    }

    if (
      formulario.tipo === 'SAÍDA' &&
      quantidade > saldoAnterior
    ) {
      alert(
        `Estoque insuficiente! Disponível: ` +
        `${saldoAnterior} ${insumoAtual.unidade}.`
      );
      return;
    }

    const saldoNovo = Number((
      formulario.tipo === 'ENTRADA'
        ? saldoAnterior + quantidade
        : saldoAnterior - quantidade
    ).toFixed(4));

    const novosInsumos = estoqueAtual.map((item) =>
      String(item.id) === formulario.insumoId
        ? { ...item, quantidade: saldoNovo }
        : item
    );

    const novaMovimentacao = {
      id: crypto.randomUUID(),
      insumoId: insumoAtual.id,
      insumoNome: insumoAtual.nome,
      unidade: insumoAtual.unidade,
      tipo: formulario.tipo,
      quantidade,
      saldoAnterior,
      saldoNovo,
      observacao: formulario.observacao.trim(),
      data: new Date().toISOString(),
      origem: 'MANUAL'
    };

    const historicoAtual = lerDados(
      'horta_movimentacoes',
      []
    );

    const novoHistorico = [
      novaMovimentacao,
      ...historicoAtual
    ];

    localStorage.setItem(
      'horta_insumos',
      JSON.stringify(novosInsumos)
    );

    localStorage.setItem(
      'horta_movimentacoes',
      JSON.stringify(novoHistorico)
    );

    setInsumos(novosInsumos);
    setMovimentacoes(novoHistorico);
    setFormulario({ ...formularioInicial });

    alert('Movimentação registrada com sucesso!');
  }



function estornarMovimentacao(movimentacao) {
  // 1. Lê os dados mais recentes.
  const historicoAtual = lerDados(
    'horta_movimentacoes',
    []
  );

  const estoqueAtual = lerDados(
    'horta_insumos',
    []
  );

  // 2. Localiza a movimentação original.
  const original = historicoAtual.find(
    (item) => item.id === movimentacao.id
  );

  if (!original) {
    alert('Movimentação não encontrada.');
    return;
  }

  // 3. Impede estornar um estorno.
  if (original.origem === 'ESTORNO') {
    alert('Não é possível estornar um estorno.');
    return;
  }

  // 4. Impede estorno duplicado.
  const jaEstornada = historicoAtual.some(
    (item) =>
      item.origem === 'ESTORNO' &&
      item.movimentacaoOriginalId === original.id
  );

  if (jaEstornada) {
    alert('Esta movimentação já foi estornada.');
    return;
  }

  // 5. Bloqueia estorno direto de consumo por tarefa.
  if (original.origem === 'TAREFA') {
    alert(
      'Esta saída pertence a uma tarefa concluída. ' +
      'O estorno deverá ser feito por um procedimento ' +
      'específico de correção da tarefa.'
    );
    return;
  }

  // 6. Localiza o insumo.
  const insumo = estoqueAtual.find(
    (item) =>
      String(item.id) === String(original.insumoId)
  );

  if (!insumo) {
    alert('Insumo não encontrado.');
    return;
  }

  const quantidade = Number(original.quantidade);
  const saldoAnterior = Number(insumo.quantidade);

  if (
    !Number.isFinite(quantidade) ||
    quantidade <= 0 ||
    !Number.isFinite(saldoAnterior) ||
    saldoAnterior < 0
  ) {
    alert('Dados inválidos para realizar o estorno.');
    return;
  }

  // 7. Inverte o tipo da movimentação.
  const tipoEstorno =
    original.tipo === 'ENTRADA' ? 'SAÍDA' : 'ENTRADA';

  if (
    original.tipo !== 'ENTRADA' &&
    original.tipo !== 'SAÍDA'
  ) {
    alert('Tipo de movimentação inválido.');
    return;
  }

  // 8. Impede saldo negativo.
  if (
    tipoEstorno === 'SAÍDA' &&
    quantidade > saldoAnterior
  ) {
    alert(
      'Não é possível estornar esta entrada, ' +
      'pois o estoque atual é insuficiente.'
    );
    return;
  }

  // 9. Solicita justificativa.
  const justificativa = window.prompt(
    'Informe o motivo do estorno:'
  );

  if (justificativa === null) return;

  if (!justificativa.trim()) {
    alert('A justificativa é obrigatória.');
    return;
  }

  const confirmar = window.confirm(
    'Confirma o estorno desta movimentação?'
  );

  if (!confirmar) return;

  // 10. Calcula o saldo corrigido.
  const saldoNovo = Number((
    tipoEstorno === 'ENTRADA'
      ? saldoAnterior + quantidade
      : saldoAnterior - quantidade
  ).toFixed(4));

  // 11. Atualiza o estoque.
  const novosInsumos = estoqueAtual.map((item) =>
    String(item.id) === String(insumo.id)
      ? { ...item, quantidade: saldoNovo }
      : item
  );

  // 12. Cria o registro de estorno.
  const estorno = {
    id: crypto.randomUUID(),
    insumoId: insumo.id,
    insumoNome: insumo.nome,
    unidade: insumo.unidade,
    tipo: tipoEstorno,
    quantidade,
    saldoAnterior,
    saldoNovo,
    observacao: `ESTORNO: ${justificativa.trim()}`,
    data: new Date().toISOString(),
    origem: 'ESTORNO',
    movimentacaoOriginalId: original.id
  };

  const novoHistorico = [
    estorno,
    ...historicoAtual
  ];

  // 13. Salva os dados.
  localStorage.setItem(
    'horta_insumos',
    JSON.stringify(novosInsumos)
  );

  localStorage.setItem(
    'horta_movimentacoes',
    JSON.stringify(novoHistorico)
  );

  // 14. Atualiza a interface.
  setInsumos(novosInsumos);
  setMovimentacoes(novoHistorico);

  alert('Estorno registrado com sucesso!');
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
            Registre entradas e saídas de materiais da horta.
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
                    key={insumo.id}
                    value={insumo.id}
                  >
                    {insumo.nome} — {insumo.quantidade}{' '}
                    {insumo.unidade}
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
                min="0.0001"
                step="any"
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
                placeholder="Ex.: Adubo utilizado no Canteiro B"
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
              <h2>Estoque atual</h2>

              {insumos.map((insumo) => {
                const estoqueBaixo =
                  Number(insumo.quantidade) <
                  Number(insumo.estoqueMinimo);

                return (
                  <div
                    className="movimentacoes-saldo"
                    key={insumo.id}
                  >
                    <div>
                      <strong>{insumo.nome}</strong>
                      <span>
                        Mínimo: {insumo.estoqueMinimo}{' '}
                        {insumo.unidade}
                      </span>
                    </div>

                    <div>
                      <strong>
                        {insumo.quantidade} {insumo.unidade}
                      </strong>

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
                        <span className={
                          mov.tipo === 'ENTRADA'
                            ? 'mov-tipo-entrada'
                            : 'mov-tipo-saida'
                        }>
                          {mov.tipo}
                        </span>
                      </td>

                      <td>
                        {mov.quantidade} {mov.unidade}
                      </td>

                      <td>
                        {mov.saldoAnterior} {mov.unidade}
                      </td>

                      <td>
                        {mov.saldoNovo} {mov.unidade}
                      </td>

                      <td>{mov.observacao || '-'}</td>


<td>
  {mov.origem !== 'ESTORNO' &&
   mov.origem !== 'TAREFA' &&
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
        : mov.origem === 'TAREFA'
        ? 'Vinculada à tarefa'
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
