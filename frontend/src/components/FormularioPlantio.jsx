function FormularioPlantio({
  formulario,
  setFormulario,
  culturas,
  canteiros,
  insumos = [],
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
          <option key={cultura.id_cultura} value={cultura.id_cultura}>
            {cultura.nome} ({cultura.tempo_maturacao_dias} dias)
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
          <option key={canteiro.id_canteiro} value={canteiro.id_canteiro}>
            {canteiro.identificacao} — {canteiro.area_m2} m²
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
        <option value="CRESCIMENTO">Em crescimento</option>
        <option value="COLHIDO">Colhido</option>
        <option value="PERDIDO">Perdido</option>
      </select>

      <label htmlFor="peso-colhido">Peso colhido (kg - opcional)</label>
      <input
        id="peso-colhido"
        name="pesoColhido"
        type="number"
        min="0"
        step="0.01"
        value={formulario.pesoColhido}
        onChange={alterarCampo}
        placeholder="Ex.: 12.5"
      />

      {!editando && (
        <>
          <label htmlFor="insumo-plantio">Insumo utilizado no plantio (opcional)</label>
          <select
            id="insumo-plantio"
            name="insumoId"
            value={formulario.insumoId || ''}
            onChange={alterarCampo}
          >
            <option value="">Nenhum</option>
            {insumos.map((insumo) => (
              <option key={insumo.id_insumo} value={insumo.id_insumo}>
                {insumo.nome} (Estoque: {insumo.quantidade_estoque})
              </option>
            ))}
          </select>

          {formulario.insumoId && (
            <>
              <label htmlFor="quantidade-insumo-plantio">Quantidade utilizada</label>
              <input
                id="quantidade-insumo-plantio"
                name="quantidadeInsumo"
                type="number"
                min="0.01"
                step="0.01"
                value={formulario.quantidadeInsumo || ''}
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
          SALVAR
        </button>
      </div>
    </form>
  );
}

export default FormularioPlantio;
