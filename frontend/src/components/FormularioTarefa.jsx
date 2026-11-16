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

      <label htmlFor="descricao-tarefa">Descrição da atividade</label>
      <textarea
        id="descricao-tarefa"
        name="descricao"
        value={formulario.descricao}
        onChange={alterarCampo}
        rows="3"
        placeholder="Ex.: Regar e adubar o Canteiro A"
        required
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
          <option key={canteiro.id_canteiro} value={canteiro.id_canteiro}>
            {canteiro.identificacao} ({canteiro.area_m2} m²)
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
          <option key={membro.id_usuario} value={membro.id_usuario}>
            {membro.nome} ({membro.perfil})
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

      {!editando && (
        <>
          <label htmlFor="insumo-tarefa">Insumo / Ferramenta necessária (opcional)</label>
          <select
            id="insumo-tarefa"
            name="insumoId"
            value={formulario.insumoId}
            onChange={alterarCampo}
          >
            <option value="">Nenhum</option>
            {insumos.map((insumo) => (
              <option key={insumo.id_insumo} value={insumo.id_insumo}>
                {insumo.nome} [{insumo.tipo}] — Estoque: {insumo.quantidade_estoque}
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
          {editando ? 'SALVAR ALTERAÇÕES' : 'VERIFICAR DISPONIBILIDADE'}
        </button>
      </div>
    </form>
  );
}

export default FormularioTarefa;
