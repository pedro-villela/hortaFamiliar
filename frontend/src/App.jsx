
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

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página inicial */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login e cadastro */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Cadastros */}
        <Route path="/culturas" element={<Culturas />} />
        <Route path="/canteiros" element={<Canteiros />} />
        <Route path="/insumos" element={<Insumos />} />

        {/* Gestão da horta */}
        <Route path="/plantios" element={<Plantios />} />
        <Route path="/tarefas" element={<Tarefas />} />
        <Route
          path="/minhas-tarefas"
          element={<MinhasTarefas />}
        />

        {/* Movimentações e colheitas */}
        <Route
          path="/movimentacoes"
          element={<Movimentacoes />}
        />
        <Route path="/colheitas" element={<Colheitas />} />
        <Route path="/producao" element={<Producao />} />

        {/* Relatórios gerenciais */}
        <Route path="/relatorios" element={<Relatorios />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
