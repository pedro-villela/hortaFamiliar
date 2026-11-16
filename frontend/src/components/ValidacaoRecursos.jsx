import './ValidacaoRecursos.css';

function ValidacaoRecursos({
  tarefa,
  canteiro,
  responsavel,
  insumo,
  conflitos = [],
  avisos = [],
  voltar,
  confirmar
}) {
  const disponivel = conflitos.length === 0;

  function formatarData(data) {
    if (!data) return '-';

    const [ano, mes, dia] = String(data).slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  }

  return (
    <section className="validacao-recursos">
      <h2>
        {disponivel
          ? 'Validação de Recursos'
          : 'Conflito de Recursos'}
      </h2>

      <p>
        {disponivel
          ? 'Confira a disponibilidade dos recursos antes de criar a tarefa.'
          : 'Não foi possível validar a tarefa. Revise os recursos selecionados.'}
      </p>

      <div
        className={
          disponivel
            ? 'validacao-aviso sucesso'
            : 'validacao-aviso erro'
        }
        role="status"
      >
        {disponivel
          ? '✓ Recursos validados para envio'
          : '⚠ Foram encontrados conflitos'}
      </div>

      <div className="validacao-cartao">
        <h3>Dados da tarefa</h3>

        <p>
          <strong>Descrição:</strong> {tarefa.descricao}
        </p>

        <p>
          <strong>Responsável:</strong> {responsavel?.nome}
        </p>

        <p>
          <strong>Canteiro:</strong> {canteiro?.identificacao}
        </p>

        <p>
          <strong>Data:</strong> {formatarData(tarefa.data)}
        </p>

        <p>
          <strong>Horário:</strong> {tarefa.inicio} às {tarefa.fim}
        </p>

        <h3>Recursos verificados</h3>

        <div className="validacao-recurso">
          <span>Canteiro</span>
          <strong>{canteiro?.identificacao || 'Não encontrado'}</strong>
        </div>

        <div className="validacao-recurso">
          <span>Insumo / Ferramenta</span>
          <strong>{insumo?.nome || 'Não necessário'}</strong>
        </div>

        {insumo && (
          <>
            <div className="validacao-recurso">
              <span>Quantidade necessária</span>
              <strong>{tarefa.quantidadeInsumo}</strong>
            </div>

            <div className="validacao-recurso">
              <span>Estoque disponível</span>
              <strong>{insumo.quantidade_estoque}</strong>
            </div>
          </>
        )}

        {avisos.length > 0 && (
          <div className="validacao-conflitos">
            <h3>Avisos de Estoque (História #14)</h3>
            <ul>
              {avisos.map((aviso, indice) => (
                <li key={indice}>{aviso}</li>
              ))}
            </ul>
          </div>
        )}

        {!disponivel && (
          <div className="validacao-conflitos">
            <h3>Problemas encontrados</h3>

            <ul>
              {conflitos.map((conflito, indice) => (
                <li key={indice}>{conflito}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="validacao-botoes">
          <button
            type="button"
            className="validacao-voltar"
            onClick={voltar}
          >
            {disponivel ? 'VOLTAR' : 'VOLTAR E CORRIGIR'}
          </button>

          {disponivel && (
            <button
              type="button"
              className="validacao-confirmar"
              onClick={confirmar}
            >
              CONFIRMAR TAREFA
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default ValidacaoRecursos;
