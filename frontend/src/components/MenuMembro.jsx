
import { NavLink, useNavigate } from 'react-router-dom';

function MenuMembro() {
  const navigate = useNavigate();

  function sair() {
    navigate('/login');
  }

  return (
    <aside className="menu-lateral">
      <div className="logo-menu">
        <h2>Horta Familiar</h2>
        <p>Área do Membro</p>
      </div>

      <nav>
        <NavLink to="/minhas-tarefas">
          Minhas Tarefas
        </NavLink>
      </nav>

      <button type="button" onClick={sair}>
        Sair
      </button>
    </aside>
  );
}

export default MenuMembro;
