
import './ValidacaoRecursos.css';

function ValidacaoRecursos({
  tarefa,
  canteiro,
  responsavel,
  insumo,
  conflitos = [],
  voltar,
  confirmar
}) {
  const disponivel = conflitos.length === 0;

  function formatarData(data) {
    if (!data) return '-';

    const [ano, mes, dia] = data.split('-');
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
          ? '✓ Recursos disponíveis'
          : '⚠ Foram encontrados conflitos'}
      </div>

      <div className="validacao-cartao">
        <h3>Dados da tarefa</h3>

        <p>
          <strong>Tarefa:</strong> {tarefa.titulo}
        </p>

        <p>
          <strong>Responsável:</strong> {responsavel?.nome}
        </p>

        <p>
          <strong>Canteiro:</strong> {canteiro?.nome}
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
          <strong>{canteiro?.nome || 'Não encontrado'}</strong>
        </div>

        <div className="validacao-recurso">
          <span>Insumo</span>
          <strong>{insumo?.nome || 'Não necessário'}</strong>
        </div>

        {insumo && (
          <>
            <div className="validacao-recurso">
              <span>Quantidade necessária</span>
              <strong>
                {tarefa.quantidadeInsumo} {insumo.unidade}
              </strong>
            </div>

            <div className="validacao-recurso">
              <span>Estoque disponível</span>
              <strong>
                {insumo.quantidade} {insumo.unidade}
              </strong>
            </div>
          </>
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
