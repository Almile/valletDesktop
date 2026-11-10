import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Brand from "./Brand";
import ChatNavBadge from "./ChatNavBadge";
import { apiService } from "../services/api";
import { desconectarChat } from "../services/chat";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="theme-toggle-btn"
      aria-label="Alternar tema"
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      <div className={`theme-toggle-icon ${isDark ? "dark" : "light"}`}>
        {/* Ícone de Sol */}
        <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        {/* Ícone de Lua */}
        <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </div>
    </button>
  );
}

export default function Layout({ title, children }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    } finally {
      await desconectarChat();
      navigate("/login");
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Brand />

        <nav className="main-navigation">
          <NavLink to="/" end>
              <span 
                  style={{ 
                      width: "22px", 
                      height: "22px", 
                      backgroundColor: "currentColor", 
                      WebkitMask: "url('/src/assets/home.png') center / contain no-repeat",
                      mask: "url('/src/assets/home.png') center / contain no-repeat",
                      display: "inline-block"
                  }}
              ></span>
              <span>Início</span>
          </NavLink>
          <NavLink to="/estacionamentos" className="menu-item">
              <span 
                  style={{ 
                      width: "22px", 
                      height: "22px", 
                      backgroundColor: "currentColor", 
                      WebkitMask: "url('/src/assets/parking.png') center / contain no-repeat",
                      mask: "url('/src/assets/parking.png') center / contain no-repeat",
                      display: "inline-block"
                  }}
              ></span>
              <span>Estacionamentos</span>
          </NavLink>
          <NavLink to="/gerentes" className="menu-item">
              <span 
                  style={{ 
                      width: "22px", 
                      height: "22px", 
                      backgroundColor: "currentColor", 
                      WebkitMask: "url('/src/assets/person.png') center / contain no-repeat",
                      mask: "url('/src/assets/person.png') center / contain no-repeat",
                      display: "inline-block"
                  }}
              ></span>
              <span>Gerentes</span>
          </NavLink>
          <NavLink to="/chat" className="menu-item">
              <span 
                  style={{ 
                      width: "22px", 
                      height: "22px", 
                      backgroundColor: "currentColor", 
                      WebkitMask: "url('/src/assets/chat.png') center / contain no-repeat",
                      mask: "url('/src/assets/chat.png') center / contain no-repeat",
                      display: "inline-block"
                  }}
              ></span>
              <span>Chat</span>
              <ChatNavBadge />
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

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <ThemeToggle />
            <div className="administrator-summary">
              <span className="administrator-avatar">AD</span>
              <div>
                <strong>Administrador</strong>
                <small>Conta principal</small>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}