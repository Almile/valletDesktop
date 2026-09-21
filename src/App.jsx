import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DetalhesEstacionamento from "./pages/DetalhesEstacionamento";
import Estacionamentos from "./pages/Estacionamentos";
import Gerentes from "./pages/Gerentes";
import { CadastroEstacionamento } from "./pages/Estacionamentos";
import { CadastroGerente } from "./pages/Gerentes";
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/estacionamentos" element={<Estacionamentos />} />
      <Route
        path="/estacionamentos/novo"
        element={<CadastroEstacionamento />}
      />
      <Route
        path="/estacionamentos/:estacionamentoId"
        element={<DetalhesEstacionamento />}
      />
      <Route path="/gerentes" element={<Gerentes />} />
      <Route path="/gerentes/novo" element={<CadastroGerente />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
