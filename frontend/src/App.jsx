import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Culturas from './pages/Culturas';
import Canteiros from './pages/Canteiros';
import Insumos from './pages/Insumos';
import Plantios from './pages/Plantios';
import Tarefas from './pages/Tarefas';
import MinhasTarefas from './pages/MinhasTarefas';
import Movimentacoes from './pages/Movimentacoes';
import Relatorios from './pages/Relatorios';
import Colheitas from './pages/Colheitas';
import Producao from './pages/Producao';
import Usuarios from './pages/Usuarios';

import { obterToken, obterUsuarioLogado } from './services/api';
import './App.css';

function RotaProtegida({ children, apenasAdmin = false }) {
  const token = obterToken();
  const usuario = obterUsuarioLogado();

  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (apenasAdmin && usuario.perfil !== 'ADMIN') {
    return <Navigate to="/minhas-tarefas" replace />;
  }

  return children;
}

function RedirecionamentoInicial() {
  const token = obterToken();
  const usuario = obterUsuarioLogado();

  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={usuario.perfil === 'ADMIN' ? '/dashboard' : '/minhas-tarefas'}
      replace
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página inicial inteligente */}
        <Route path="/" element={<RedirecionamentoInicial />} />

        {/* Login e cadastro (Públicas) */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Dashboard (Apenas Admin) */}
        <Route
          path="/dashboard"
          element={<RotaProtegida apenasAdmin><Dashboard /></RotaProtegida>}
        />

        {/* Cadastros (Apenas Admin) */}
        <Route
          path="/culturas"
          element={<RotaProtegida apenasAdmin><Culturas /></RotaProtegida>}
        />
        <Route
          path="/canteiros"
          element={<RotaProtegida apenasAdmin><Canteiros /></RotaProtegida>}
        />
        <Route
          path="/insumos"
          element={<RotaProtegida apenasAdmin><Insumos /></RotaProtegida>}
        />
        <Route
          path="/usuarios"
          element={<RotaProtegida apenasAdmin><Usuarios /></RotaProtegida>}
        />

        {/* Gestão da horta */}
        <Route
          path="/plantios"
          element={<RotaProtegida apenasAdmin><Plantios /></RotaProtegida>}
        />
        <Route
          path="/tarefas"
          element={<RotaProtegida apenasAdmin><Tarefas /></RotaProtegida>}
        />

        {/* Área do Membro / Minhas Tarefas (Qualquer usuário logado) */}
        <Route
          path="/minhas-tarefas"
          element={<RotaProtegida><MinhasTarefas /></RotaProtegida>}
        />

        {/* Movimentações e colheitas (Apenas Admin) */}
        <Route
          path="/movimentacoes"
          element={<RotaProtegida apenasAdmin><Movimentacoes /></RotaProtegida>}
        />
        <Route
          path="/colheitas"
          element={<RotaProtegida apenasAdmin><Colheitas /></RotaProtegida>}
        />
        <Route
          path="/producao"
          element={<RotaProtegida apenasAdmin><Producao /></RotaProtegida>}
        />

        {/* Relatórios gerenciais (Apenas Admin) */}
        <Route
          path="/relatorios"
          element={<RotaProtegida apenasAdmin><Relatorios /></RotaProtegida>}
        />

        {/* Qualquer rota inexistente redireciona com segurança */}
        <Route path="*" element={<RedirecionamentoInicial />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
