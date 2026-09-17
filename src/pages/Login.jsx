import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../components/Brand";

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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/");
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

          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            placeholder="administrador@email.com"
            required
          />

          <label htmlFor="password">Senha</label>
          <div className="password-input">
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              placeholder="Digite sua senha"
              minLength="6"
              required
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

          <button type="submit" className="primary-button">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
