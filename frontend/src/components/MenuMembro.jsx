import { NavLink, useNavigate } from 'react-router-dom';
import './MenuLateral.css';
import { limparSessao, obterUsuarioLogado } from '../services/api';

function MenuMembro({ aoClicarInicio }) {
  const navigate = useNavigate();
  const usuario = obterUsuarioLogado();

  function sair() {
    limparSessao();
    navigate('/login');
  }

  return (
    <aside className="menu-lateral">
      <div className="logo-menu">
        <h2>HORTA FAMILIAR</h2>
        <p>Área do Membro</p>
      </div>

      <nav>
        <NavLink
          to="/minhas-tarefas"
          onClick={() => {
            if (aoClicarInicio) aoClicarInicio();
          }}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Minhas Tarefas
        </NavLink>

        {usuario?.perfil === 'ADMIN' && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            ← Voltar ao Painel Admin
          </NavLink>
        )}
      </nav>

      <button type="button" className="botao-sair" onClick={sair}>
        Sair
      </button>
    </aside>
  );
}

export default MenuMembro;
