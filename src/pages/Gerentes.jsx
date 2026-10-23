import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";
import { applyMask, formatPhone } from "../utils/inputMasks";

export default function Gerentes() {
  const [gerentes, setGerentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarGerentes();
  }, []);

  async function carregarGerentes() {
    try {
      setLoading(true);
      const data = await apiService.getGerentes();
      setGerentes(data || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar lista de gerentes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Gerentes">
      <section className="list-card">
        <header className="list-header">
          <div>
            <h2>Gerentes cadastrados</h2>
            <p>Consulte os responsáveis vinculados aos estacionamentos.</p>
          </div>
          <Link className="primary-link" to="/gerentes/novo">
            + Novo gerente
          </Link>
        </header>

        {error && (
          <div style={{ color: "red", padding: "12px 24px" }}>
            {error}
          </div>
        )}

        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th>Gerente</th>
                <th>Contato</th>
                <th>Estacionamento</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    Carregando gerentes...
                  </td>
                </tr>
              ) : gerentes.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan="5">
                    <div className="table-empty-state">
                      <span>♙</span>
                      <strong>Nenhum gerente cadastrado</strong>
                      <p>Os gerentes aparecerão aqui após o cadastro.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                gerentes.map((gerente) => (
                  <tr key={gerente.uid || gerente.email}>
                    <td>
                      <strong>{gerente.nome || "Não informado"}</strong>
                      <br />
                      <small>{gerente.cargo || "Gerente / Admin"}</small>
                    </td>
                    <td>
                      {gerente.email}
                      {gerente.telefone && <><br /><small>{gerente.telefone}</small></>}
                    </td>
                    <td>{gerente.estacionamentoNome || gerente.estacionamentoId || "Geral"}</td>
                    <td>
                      <span className="badge badge-success">Ativo</span>
                    </td>
                    <td>
                      <Link to={`/gerentes/${gerente.uid}`} className="table-action-btn">
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

export function CadastroGerente() {
  const navigate = useNavigate();
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function carregarEstacionamentos() {
      try {
        const lista = await apiService.getEstacionamentos();
        setEstacionamentos(lista || []);
      } catch (err) {
        console.warn("Não foi possível carregar os estacionamentos:", err);
      }
    }
    carregarEstacionamentos();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (data.senha !== data.confirmacaoSenha) {
      setErrorMessage("As senhas informadas não coincidem.");
      return;
    }

    setSubmitting(true);

    const payload = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      senha: data.senha,
      tipo_user: "admin",
      cargo: "Gerente",
      estacionamentoId: data.estacionamentoId,
    };

    try {
      await apiService.criarGerente(payload);
      alert("Gerente cadastrado com sucesso!");
      navigate("/gerentes");
    } catch (err) {
      setErrorMessage(err.message || "Erro ao cadastrar gerente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout title="Cadastrar gerente">
      <section className="form-card">
        <header className="form-header">
          <div>
            <h2>Dados do usuário gerente</h2>
            <p>
              Crie o acesso do gerente e associe-o ao estacionamento
              responsável.
            </p>
          </div>
        </header>

        {errorMessage && (
          <div style={{ color: "red", backgroundColor: "#ffe6e6", padding: "12px", borderRadius: "6px", margin: "16px 24px" }}>
            {errorMessage}
          </div>
        )}

        <form className="registration-form" onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend>Informações pessoais</legend>
            <div className="form-grid">
              <label className="form-field form-field--wide">
                <span>Nome completo</span>
                <input
                  name="nome"
                  type="text"
                  placeholder="Nome do gerente"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="form-field">
                <span>Cargo</span>
                <input name="cargo" type="text" value="Gerente" readOnly />
              </label>
              <label className="form-field form-field--wide">
                <span>E-mail</span>
                <input
                  name="email"
                  type="email"
                  placeholder="gerente@empresa.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="form-field">
                <span>Telefone</span>
                <input
                  name="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  maxLength="15"
                  onChange={applyMask(formatPhone)}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Vínculo e acesso</legend>
            <div className="form-grid">
              <label className="form-field">
                <span>Senha provisória</span>
                <input
                  name="senha"
                  type="password"
                  minLength="6"
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="form-field">
                <span>Confirmar senha</span>
                <input
                  name="confirmacaoSenha"
                  type="password"
                  minLength="6"
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  required
                />
              </label>
            </div>
          </fieldset>

          <footer className="form-actions">
            <Link className="cancel-link" to="/gerentes">
              Cancelar
            </Link>
            <button className="secondary-action" type="reset">
              Limpar
            </button>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Cadastrando..." : "Cadastrar gerente"}
            </button>
          </footer>
        </form>
      </section>
    </Layout>
  );
}