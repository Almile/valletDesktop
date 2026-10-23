import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DetalhesEstacionamento from "./pages/DetalhesEstacionamento";
import Estacionamentos from "./pages/Estacionamentos";
import Gerentes from "./pages/Gerentes";
import DetalhesGerente from "./pages/DetalhesGerente";
import ProtectedRoute from "./components/ProtectedRoute";

import { CadastroGerenteEstacionamento } from "./pages/CadastroGerenteEstacionamento";
import { CadastroEstacionamento } from "./pages/Estacionamentos";
import { CadastroGerente } from "./pages/Gerentes";
export default function App() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/estacionamentos" element={<Estacionamentos />} />
        <Route path="/gerentes" element={<Gerentes />} />
        <Route path="/gerentes/:gerenteId" element={<DetalhesGerente />} />
        <Route
          path="/estacionamentos/novo/gerente"
          element={<CadastroGerenteEstacionamento />}
        />
        <Route
          path="/estacionamentos/novo"
          element={<CadastroEstacionamento />}
        />
        <Route
          path="/estacionamentos/:estacionamentoId/editar"
          element={<CadastroEstacionamento />}
        />
        <Route
          path="/estacionamentos/:estacionamentoId"
          element={<DetalhesEstacionamento />}
        />
        <Route path="/gerentes/novo" element={<CadastroGerente />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
