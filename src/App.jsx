import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Estacionamentos from "./pages/Estacionamentos";
import Gerentes from "./pages/Gerentes";
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/estacionamentos" element={<Estacionamentos />} />
      <Route path="/gerentes" element={<Gerentes />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
