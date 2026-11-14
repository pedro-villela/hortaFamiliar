
function FormularioInsumo({
  formulario,
  setFormulario,
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
    <form className="formulario-insumo" onSubmit={salvar}>
      <h2>{editando ? 'Editar Insumo' : 'Novo Insumo'}</h2>

      <label htmlFor="nome-insumo">Nome do insumo</label>
      <input
        id="nome-insumo"
        name="nome"
        value={formulario.nome}
        onChange={alterarCampo}
        placeholder="Ex.: Semente de alface"
        required
      />

      <label htmlFor="categoria-insumo">Categoria</label>
      <select
        id="categoria-insumo"
        name="categoria"
        value={formulario.categoria}
        onChange={alterarCampo}
      >
        <option value="Sementes">Sementes</option>
        <option value="Fertilizantes">Fertilizantes</option>
        <option value="Ferramentas">Ferramentas</option>
        <option value="Outros">Outros</option>
      </select>

      <label htmlFor="quantidade-insumo">Quantidade disponível</label>
      <input
        id="quantidade-insumo"
        name="quantidade"
        type="number"
        min="0"
        step="0.01"
        value={formulario.quantidade}
        onChange={alterarCampo}
        required
      />

      <label htmlFor="unidade-insumo">Unidade de medida</label>
      <select
        id="unidade-insumo"
        name="unidade"
        value={formulario.unidade}
        onChange={alterarCampo}
      >
        <option value="un">Unidade (un)</option>
        <option value="kg">Quilograma (kg)</option>
        <option value="g">Grama (g)</option>
        <option value="L">Litro (L)</option>
        <option value="mL">Mililitro (mL)</option>
      </select>

      <label htmlFor="minimo-insumo">Estoque mínimo</label>
      <input
        id="minimo-insumo"
        name="estoqueMinimo"
        type="number"
        min="0"
        step="0.01"
        value={formulario.estoqueMinimo}
        onChange={alterarCampo}
        required
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

export default FormularioInsumo;
