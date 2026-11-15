import { obterUsuarioLogado } from '../services/api';

function BarraSuperior() {
  const usuario = obterUsuarioLogado();

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
          <strong>{usuario?.nome || 'Usuário'}</strong>
          <small>
            {usuario?.perfil === 'ADMIN' ? 'Administrador' : 'Membro Operacional'}
          </small>
        </div>
      </div>
    </header>
  );
}

export default BarraSuperior;
