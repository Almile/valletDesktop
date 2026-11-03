import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import { apiService } from "../services/api";

function EyeIcon({ passwordVisible }) {
  return passwordVisible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.9 4.2A10.9 10.9 0 0112 4c5.5 0 9 5.5 9 5.5a16 16 0 01-2.2 2.8M6.6 6.6A16.4 16.4 0 003 9.5S6.5 15 12 15c1 0 2-.2 2.8-.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.5-5.5 9-5.5S21 12 21 12s-3.5 5.5-9 5.5S3 12 3 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiService.login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-presentation">
        <Brand large />

        <div className="presentation-content">
          <p className="section-label">PAINEL ADMINISTRATIVO</p>
          <h1>Gestão simples para o seu estacionamento.</h1>
          <p>
            Cadastre estacionamentos, organize vagas e gerencie sua equipe em um
            único lugar.
          </p>
        </div>

        <div className="feature-list">ESTACIONAMENTOS • VAGAS • EQUIPE</div>
      </section>

      <section className="login-form-area">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="mobile-logo">
            <Brand />
          </div>

          <p className="section-label">BEM-VINDO DE VOLTA</p>
          <h2>Acesse sua conta</h2>

          {error && (
            <div style={{ color: "#e53e3e", marginBottom: "1rem", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            placeholder="administrador@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label htmlFor="password">Senha</label>
          <div className="password-input">
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-visibility-button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
              title={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
            >
              <EyeIcon passwordVisible={passwordVisible} />
            </button>
          </div>

          <div className="password-help">
            <button type="button" className="text-button">
              Esqueci minha senha
            </button>
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}