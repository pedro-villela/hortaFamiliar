
import { NavLink, useNavigate } from 'react-router-dom';
import './MenuLateral.css';

function MenuLateral() {
  const navigate = useNavigate();

  const itensMenu = [
    { nome: 'Dashboard', caminho: '/dashboard' },
    { nome: 'Culturas', caminho: '/culturas' },
    { nome: 'Canteiros', caminho: '/canteiros' },
    { nome: 'Plantios', caminho: '/plantios' },
    { nome: 'Insumos', caminho: '/insumos' },
    { nome: 'Tarefas', caminho: '/tarefas' },
    { nome: 'Relatórios', caminho: '/relatorios' },
    { nome: 'Movimentações', caminho: '/movimentacoes' },
    { nome: 'Colheitas', caminho: '/colheitas' },
    { nome: 'Produção', caminho: '/producao' }
  ];

  function sair() {
    navigate('/login');
  }

  return (
    <aside className="menu-lateral">
      <h2>HORTA FAMILIAR</h2>

      <nav>
        {itensMenu.map((item) => (
          <NavLink
            key={item.caminho}
            to={item.caminho}
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            {item.nome}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="botao-sair"
        onClick={sair}
      >
        Sair
      </button>
    </aside>
  );
}

export default MenuLateral;
