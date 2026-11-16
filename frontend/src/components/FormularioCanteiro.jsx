
function FormularioCanteiro({
  formulario,
  setFormulario,
  salvar,
  cancelar,
  editando
}) {
  return (
    <form className="formulario-canteiro" onSubmit={salvar}>
      <h2>{editando ? 'Editar Canteiro' : 'Novo Canteiro'}</h2>

      <label htmlFor="nome-canteiro">Nome do Canteiro</label>
      <input
        id="nome-canteiro"
        value={formulario.nome}
        onChange={(e) =>
          setFormulario({ ...formulario, nome: e.target.value })
        }
        placeholder="Ex.: Canteiro F"
        required
      />

      <label htmlFor="area-canteiro">Área do Canteiro (m²)</label>
      <input
        id="area-canteiro"
        type="number"
        min="0.01"
        step="0.01"
        value={formulario.area}
        onChange={(e) =>
          setFormulario({ ...formulario, area: e.target.value })
        }
        placeholder="Ex.: 10"
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

export default FormularioCanteiro;
