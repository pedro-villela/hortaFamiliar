
function FormularioPlantio({
  formulario,
  setFormulario,
  culturas,
  canteiros,
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
    <form className="formulario-plantio" onSubmit={salvar}>
      <h2>{editando ? 'Editar Plantio' : 'Novo Plantio'}</h2>

      <label htmlFor="cultura-plantio">Cultura</label>
      <select
        id="cultura-plantio"
        name="culturaId"
        value={formulario.culturaId}
        onChange={alterarCampo}
        required
      >
        <option value="">Selecione uma cultura</option>

        {culturas.map((cultura) => (
          <option key={cultura.id} value={cultura.id}>
            {cultura.nome}
          </option>
        ))}
      </select>

      <label htmlFor="canteiro-plantio">Canteiro</label>
      <select
        id="canteiro-plantio"
        name="canteiroId"
        value={formulario.canteiroId}
        onChange={alterarCampo}
        required
      >
        <option value="">Selecione um canteiro</option>

        {canteiros.map((canteiro) => (
          <option key={canteiro.id} value={canteiro.id}>
            {canteiro.nome} — {canteiro.area} m²
          </option>
        ))}
      </select>

      <label htmlFor="data-plantio">Data do plantio</label>
      <input
        id="data-plantio"
        name="dataPlantio"
        type="date"
        value={formulario.dataPlantio}
        onChange={alterarCampo}
        required
      />

      <label htmlFor="status-plantio">Status</label>
      <select
        id="status-plantio"
        name="status"
        value={formulario.status}
        onChange={alterarCampo}
      >
        <option value="PLANEJADO">Planejado</option>
        <option value="EM ANDAMENTO">Em andamento</option>
        <option value="CONCLUÍDO">Concluído</option>
      </select>

      <label htmlFor="observacoes-plantio">Observações</label>
      <textarea
        id="observacoes-plantio"
        name="observacoes"
        value={formulario.observacoes}
        onChange={alterarCampo}
        rows="4"
        placeholder="Ex.: Plantio realizado após adubação."
      />

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

export default FormularioPlantio;
