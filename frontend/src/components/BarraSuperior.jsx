
function BarraSuperior() {
  return (
    <header className="barra-superior">
      <input
        type="search"
        placeholder="Buscar no sistema..."
        aria-label="Buscar no sistema"
      />

      <div className="usuario">
        <span>👤</span>
        <div>
          <strong>Usuário</strong>
          <small>Administrador</small>
        </div>
      </div>
    </header>
  );
}

export default BarraSuperior;
