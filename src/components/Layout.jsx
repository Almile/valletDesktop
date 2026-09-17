import { NavLink, useNavigate } from "react-router-dom";
import Brand from "./Brand";
import { apiService } from "../services/api";

export default function Layout({ title, children }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    } finally {
      navigate("/login");
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Brand />

        <nav className="main-navigation">
          <NavLink to="/" end>
            ▦ <span>Visão geral</span>
          </NavLink>
          <NavLink to="/estacionamentos">
            ▣ <span>Estacionamentos</span>
          </NavLink>
          <NavLink to="/gerentes">
            ♙ <span>Gerentes</span>
          </NavLink>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          ↪ <span>Sair</span>
        </button>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="section-label">PAINEL ADMINISTRATIVO</p>
            <h1>{title}</h1>
          </div>

          <div className="administrator-summary">
            <span className="administrator-avatar">AD</span>
            <div>
              <strong>Administrador</strong>
              <small>Conta principal</small>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}