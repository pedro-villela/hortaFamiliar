import { obterUsuarioLogado } from '../services/api';

function BarraSuperior() {
  const usuario = obterUsuarioLogado();

  return (
    <header className="barra-superior">
      <div>
        <strong>🌱 Sistema de Gestão Horta Comunitária e Familiar</strong>
      </div>

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
