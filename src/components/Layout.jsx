import { NavLink, useNavigate } from "react-router-dom";
import Brand from "./Brand";

export default function Layout({ title, children }) {
  const navigate = useNavigate();

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

        <button className="logout-button" onClick={() => navigate("/login")}>
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
