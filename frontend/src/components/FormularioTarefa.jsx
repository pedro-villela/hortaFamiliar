
function FormularioTarefa({
  formulario,
  setFormulario,
  canteiros,
  insumos,
  membros,
  salvar,
  cancelar,
  editando
}) {
  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  }

  return (
    <form className="formulario-tarefa" onSubmit={salvar}>
      <h2>{editando ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>

      <label htmlFor="titulo-tarefa">Título da tarefa</label>
      <input
        id="titulo-tarefa"
        name="titulo"
        value={formulario.titulo}
        onChange={alterarCampo}
        placeholder="Ex.: Regar canteiro"
        required
      />

      <label htmlFor="descricao-tarefa">Descrição</label>
      <textarea
        id="descricao-tarefa"
        name="descricao"
        value={formulario.descricao}
        onChange={alterarCampo}
        rows="3"
        placeholder="Descreva a atividade..."
      />

      <label htmlFor="canteiro-tarefa">Canteiro</label>
      <select
        id="canteiro-tarefa"
        name="canteiroId"
        value={formulario.canteiroId}
        onChange={alterarCampo}
        required
      >
        <option value="">Selecione um canteiro</option>
        {canteiros.map((canteiro) => (
          <option key={canteiro.id} value={canteiro.id}>
            {canteiro.nome}
          </option>
        ))}
      </select>

      <label htmlFor="responsavel-tarefa">Responsável</label>
      <select
        id="responsavel-tarefa"
        name="responsavelId"
        value={formulario.responsavelId}
        onChange={alterarCampo}
        required
      >
        <option value="">Selecione um responsável</option>
        {membros.map((membro) => (
          <option key={membro.id} value={membro.id}>
            {membro.nome}
          </option>
        ))}
      </select>

      <label htmlFor="data-tarefa">Data</label>
      <input
        id="data-tarefa"
        name="data"
        type="date"
        value={formulario.data}
        onChange={alterarCampo}
        required
      />

      <label htmlFor="inicio-tarefa">Horário de início</label>
      <input
        id="inicio-tarefa"
        name="inicio"
        type="time"
        value={formulario.inicio}
        onChange={alterarCampo}
        required
      />

      <label htmlFor="fim-tarefa">Horário de término</label>
      <input
        id="fim-tarefa"
        name="fim"
        type="time"
        value={formulario.fim}
        onChange={alterarCampo}
        required
      />

      <label htmlFor="prioridade-tarefa">Prioridade</label>
      <select
        id="prioridade-tarefa"
        name="prioridade"
        value={formulario.prioridade}
        onChange={alterarCampo}
      >
        <option value="BAIXA">Baixa</option>
        <option value="MÉDIA">Média</option>
        <option value="ALTA">Alta</option>
      </select>

      <label htmlFor="status-tarefa">Status</label>
      <select
        id="status-tarefa"
        name="status"
        value={formulario.status}
        onChange={alterarCampo}
      >
        <option value="PENDENTE">Pendente</option>
        <option value="EM ANDAMENTO">Em andamento</option>
        <option value="CONCLUÍDA">Concluída</option>
      </select>

      <label htmlFor="insumo-tarefa">Insumo necessário (opcional)</label>
      <select
        id="insumo-tarefa"
        name="insumoId"
        value={formulario.insumoId}
        onChange={alterarCampo}
      >
        <option value="">Nenhum</option>
        {insumos.map((insumo) => (
          <option key={insumo.id} value={insumo.id}>
            {insumo.nome} — {insumo.quantidade} {insumo.unidade}
          </option>
        ))}
      </select>

      {formulario.insumoId && (
        <>
          <label htmlFor="quantidade-tarefa">
            Quantidade necessária
          </label>
          <input
            id="quantidade-tarefa"
            name="quantidadeInsumo"
            type="number"
            min="0.01"
            step="0.01"
            value={formulario.quantidadeInsumo}
            onChange={alterarCampo}
            required
          />
        </>
      )}

      <div className="formulario-botoes">
        <button
          type="button"
          className="botao-cancelar"
          onClick={cancelar}
        >
          CANCELAR
        </button>

        <button type="submit" className="botao-verde">
          SALVAR
        </button>
      </div>
    </form>
  );
}

export default FormularioTarefa;
