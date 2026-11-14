
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

      <label htmlFor="status-canteiro">Status</label>
      <select
        id="status-canteiro"
        value={formulario.status}
        onChange={(e) =>
          setFormulario({ ...formulario, status: e.target.value })
        }
      >
        <option value="DISPONÍVEL">Disponível</option>
        <option value="EM USO">Em uso</option>
        <option value="EM PREPARO">Em preparo</option>
      </select>

      <label htmlFor="localizacao-canteiro">Localização</label>
      <input
        id="localizacao-canteiro"
        value={formulario.localizacao}
        onChange={(e) =>
          setFormulario({ ...formulario, localizacao: e.target.value })
        }
        placeholder="Ex.: Setor norte da horta"
        required
      />

      <label htmlFor="descricao-canteiro">Descrição</label>
      <textarea
        id="descricao-canteiro"
        value={formulario.descricao}
        onChange={(e) =>
          setFormulario({ ...formulario, descricao: e.target.value })
        }
        placeholder="Descreva o canteiro..."
        rows="4"
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
