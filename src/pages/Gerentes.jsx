import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";
import { applyMask, formatPhone } from "../utils/inputMasks";

export default function Gerentes() {
  const [gerentes, setGerentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");

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

  const gerentesFiltrados = gerentes.filter((g) =>
    g.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
    g.email?.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <Layout title="Gerentes">
      <section className="list-card">
        
        {/* Cabeçalho com Título, Pesquisa e Botão lado a lado */}
        <header className="list-header" style={{ flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2>Gerentes cadastrados</h2>
            <p>Consulte os responsáveis vinculados aos estacionamentos.</p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            
            {/* Barra de Pesquisa Personalizada */}
            {!loading && (gerentes.length > 0 || termoBusca) && (
              <div style={{ position: "relative", width: "260px" }}>
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou e-mail..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 36px 0 16px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: "Poppins, sans-serif",
                    color: "var(--text-main)",
                    outline: "none",
                    background: "var(--surface)",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--support-mid)";
                    e.target.style.boxShadow = "0 0 0 2px rgba(151, 166, 151, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-light)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {termoBusca ? (
                  <button
                    type="button"
                    onClick={() => setTermoBusca("")}
                    style={{
                      position: "absolute",
                      right: "6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--secondary-color)",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-main)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    title="Limpar pesquisa"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                ) : (
                  <div style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--support-mid)",
                      pointerEvents: "none",
                      display: "flex"
                  }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                )}
              </div>
            )}

            <Link className="primary-link" to="/gerentes/novo">
              + Novo gerente
            </Link>
          </div>
        </header>

        {error && (
          <div style={{ color: "#8b2525", backgroundColor: "#fff0f0", padding: "12px", margin: "16px 24px", borderRadius: "6px" }}>
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
                      <Link className="empty-preview-link" to="/gerentes/novo">
                        Cadastrar o primeiro gerente
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : gerentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px 20px", color: "var(--secondary-color)" }}>
                    Nenhum gerente encontrado com "{termoBusca}".
                  </td>
                </tr>
              ) : (
                gerentesFiltrados.map((gerente) => (
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
                      <span 
                        className="vallet-badge" 
                        style={gerente.ativo !== false 
                          ? {color: '#057153', background: '#e6f7f1'} 
                          : {color: '#8b2525', background: '#fff0f0'}
                        }
                      >
                        {gerente.ativo !== false ? "Ativo" : "Desativado"}
                      </span>
                    </td>
                    <td>
                      <Link to={`/gerentes/${gerente.uid}`} className="table-action-btn">
                        <span>Ver detalhes</span>
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
  const { gerenteId } = useParams();
  const editando = Boolean(gerenteId);
  const [dadosIniciais, setDadosIniciais] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(editando);

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

  useEffect(() => {
    if (!editando) return;
    
    let ativo = true;
    async function carregarGerente() {
      try {
        const dados = await apiService.getGerentePorId(gerenteId);
        if (ativo) setDadosIniciais(dados);
      } catch (err) {
        if (ativo) setErrorMessage("Erro ao carregar dados do gerente.");
      } finally {
        if (ativo) setCarregandoDados(false);
      }
    }
    carregarGerente();
    return () => { ativo = false; };
  }, [gerenteId, editando]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (data.senha && data.senha !== data.confirmacaoSenha) {
      setErrorMessage("As senhas informadas não coincidem.");
      return;
    }

    setSubmitting(true);

    const payload = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      estacionamentoId: data.estacionamentoId || "",
    };

    // Apenas enviar senha se ela foi preenchida
    if (data.senha) {
      payload.senha = data.senha;
    }

    // Se estiver criando novo
    if (!editando) {
      payload.tipo_user = "admin";
      payload.cargo = "Gerente";
      if (!payload.senha) {
        setErrorMessage("A senha provisória é obrigatória para novos cadastros.");
        setSubmitting(false);
        return;
      }
    }

    try {
      if (editando) {
        await apiService.atualizarGerente(gerenteId, payload);
        alert("Gerente atualizado com sucesso!");
        navigate(`/gerentes/${gerenteId}`);
      } else {
        await apiService.criarGerente(payload);
        alert("Gerente cadastrado com sucesso!");
        navigate("/gerentes");
      }
    } catch (err) {
      setErrorMessage(err.message || "Erro ao salvar gerente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (carregandoDados) {
    return (
      <Layout title="Editar gerente">
        <p style={{ padding: "20px" }}>Carregando dados do gerente...</p>
      </Layout>
    );
  }

  return (
    <Layout title={editando ? "Editar gerente" : "Cadastrar gerente"}>
      <div className="vallet-form-container">
        {errorMessage && (
          <div role="alert" style={{ color: "#8b2525", backgroundColor: "#fff0f0", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="vallet-section">
            <h2 className="vallet-section-title">Informações pessoais</h2>
            <hr className="vallet-divider" />
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <label className="vallet-field" style={{ gridColumn: "span 2" }}>
                <span className="vallet-label">Nome completo</span>
                <input
                  name="nome"
                  type="text"
                  placeholder="Ex: João da Silva"
                  autoComplete="name"
                  defaultValue={dadosIniciais?.nome || ""}
                  required
                />
              </label>
              
              <label className="vallet-field">
                <span className="vallet-label">Cargo</span>
                <input name="cargo_display" type="text" value={dadosIniciais?.cargo || "Gerente"} disabled />
              </label>

              <label className="vallet-field" style={{ gridColumn: "span 2" }}>
                <span className="vallet-label">E-mail</span>
                <input
                  name="email"
                  type="email"
                  placeholder="gerente@empresa.com"
                  autoComplete="email"
                  defaultValue={dadosIniciais?.email || ""}
                  required
                  disabled={editando} // O e-mail costuma ser o login imutável no Firebase Auth, se for alterável remova o disabled
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Telefone</span>
                <input
                  name="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  maxLength="15"
                  onChange={applyMask(formatPhone)}
                  defaultValue={dadosIniciais?.telefone || ""}
                  required
                />
              </label>
            </div>
          </div>

          <div className="vallet-section">
            <h2 className="vallet-section-title">Vínculo e acesso</h2>
            <hr className="vallet-divider" />
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <label className="vallet-field" style={{ gridColumn: "1 / -1" }}>
                <span className="vallet-label">Vincular a um estacionamento (Opcional)</span>
                <select name="estacionamentoId" defaultValue={dadosIniciais?.estacionamentoId || ""}>
                  <option value="">Acesso geral (sem vínculo específico)</option>
                  {estacionamentos.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.nome} ({est.cnpj})
                    </option>
                  ))}
                </select>
              </label>

              <label className="vallet-field">
                <span className="vallet-label">
                  {editando ? "Nova senha (deixe em branco para manter)" : "Senha provisória"}
                </span>
                <input
                  name="senha"
                  type="password"
                  minLength="6"
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  required={!editando}
                />
              </label>
              
              <label className="vallet-field">
                <span className="vallet-label">Confirmar senha</span>
                <input
                  name="confirmacaoSenha"
                  type="password"
                  minLength="6"
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  required={!editando}
                />
              </label>
            </div>
          </div>

          <footer className="vallet-form-footer">
            <Link className="vallet-cancel-link" to={editando ? `/gerentes/${gerenteId}` : "/gerentes"}>
              Cancelar
            </Link>
            <button className="vallet-btn-clear" type="reset" disabled={submitting}>
              {editando ? "Restaurar dados" : "Limpar"}
            </button>
            <button className="vallet-btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar gerente"}
            </button>
          </footer>
        </form>
      </div>
    </Layout>
  );
}