import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";
import { applyMask, formatPhone } from "../utils/inputMasks";

export default function Gerentes() {
  const [gerentes, setGerentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");

  // Estados para Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    carregarGerentes();
  }, []);

  // Voltar para a primeira página sempre que o termo de busca mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

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

  // Cálculos de Paginação
  const totalPaginas = Math.max(1, Math.ceil(gerentesFiltrados.length / itensPorPagina));
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const gerentesPaginados = gerentesFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  const paginas = [
    ...new Set([1, paginaAtual - 1, paginaAtual, paginaAtual + 1, totalPaginas]),
  ].filter((p) => p >= 1 && p <= totalPaginas).sort((a, b) => a - b);

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
                gerentesPaginados.map((gerente) => (
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
                    <td>{gerente.estacionamentoNome || gerente.estacionamentoId || "Não vinculado"}</td>
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

        {/* Bloco de Paginação Visual */}
        {gerentesFiltrados.length > 0 && (
          <div className="vallet-pagination-bar" style={{ padding: "16px 24px" }}>
            <span aria-live="polite">
              {indiceInicial + 1}–{Math.min(indiceInicial + itensPorPagina, gerentesFiltrados.length)} de {gerentesFiltrados.length} gerentes
            </span>
            <nav className="vallet-pagination-nav" aria-label="Navegação de páginas">
              <button
                className="vallet-page-btn"
                type="button"
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(paginaAtual - 1)}
              >
                ‹
              </button>
              {paginas.map((pagina, indice) => (
                <span key={pagina} style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                  {indice > 0 && pagina - paginas[indice - 1] > 1 && <span>…</span>}
                  <button
                    className="vallet-page-btn"
                    type="button"
                    aria-current={paginaAtual === pagina ? "page" : undefined}
                    onClick={() => setPaginaAtual(pagina)}
                  >
                    {pagina}
                  </button>
                </span>
              ))}
              <button
                className="vallet-page-btn"
                type="button"
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual(paginaAtual + 1)}
              >
                ›
              </button>
            </nav>
          </div>
        )}

      </section>
    </Layout>
  );
}

export function CadastroGerente() {
  const navigate = useNavigate();
  const { gerenteId } = useParams();
  const editando = Boolean(gerenteId);
  const [dadosIniciais, setDadosIniciais] = useState(null);
  const [gerenteCarregadoId, setGerenteCarregadoId] = useState(null);
  const [vinculoSelecionado, setVinculoSelecionado] = useState("");
  const [erroEstacionamentos, setErroEstacionamentos] = useState("");
  const [tentativaCarga, setTentativaCarga] = useState(0);
  const envioEmAndamento = useRef(false);
  const [carregandoDados, setCarregandoDados] = useState(editando);

  const [estacionamentos, setEstacionamentos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  function mensagemErro(erro, padrao) {
    const detalhe = erro?.response?.data?.detail ?? erro?.detail;
    if (Array.isArray(detalhe)) {
      return detalhe.map((item) => item.msg || "Campo inválido").join("; ");
    }
    if (typeof detalhe === "string" && detalhe) return detalhe;
    return typeof erro?.message === "string" && erro.message ? erro.message : padrao;
  }

  function normalizarCampo(campo, valor) {
    const texto = String(valor ?? "").trim();
    if (campo === "telefone") return texto.replace(/\D/g, "");
    if (campo === "email") return texto.toLowerCase();
    return texto;
  }

  useEffect(() => {
    let ativo = true;
    async function carregarEstacionamentos() {
      setErroEstacionamentos("");
      try {
        const lista = await apiService.getEstacionamentos();
        if (!Array.isArray(lista)) throw new Error("A API não retornou uma lista válida de estacionamentos.");
        if (ativo) setEstacionamentos(lista);
      } catch (err) {
        if (ativo) setErroEstacionamentos(mensagemErro(err, "Não foi possível carregar os estacionamentos."));
      }
    }
    carregarEstacionamentos();
    return () => { ativo = false; };
  }, [tentativaCarga]);

  useEffect(() => {
    let ativo = true;
    setDadosIniciais(null);
    setGerenteCarregadoId(null);
    setErrorMessage("");
    setVinculoSelecionado("");
    setCarregandoDados(editando);
    if (!editando) return () => { ativo = false; };

    async function carregarGerente() {
      try {
        const dados = await apiService.getGerentePorId(gerenteId);
        if (!dados || typeof dados !== "object" || Array.isArray(dados) || typeof dados.nome !== "string" || typeof dados.email !== "string") {
          throw new Error("A API não retornou dados válidos do gerente.");
        }
        if (ativo) {
          setDadosIniciais(dados);
          setVinculoSelecionado(dados.estacionamentoId || "");
          setGerenteCarregadoId(gerenteId);
        }
      } catch (err) {
        if (ativo) setErrorMessage(mensagemErro(err, "Erro ao carregar dados do gerente."));
      } finally {
        if (ativo) setCarregandoDados(false);
      }
    }
    carregarGerente();
    return () => { ativo = false; };
  }, [gerenteId, editando, tentativaCarga]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (envioEmAndamento.current) return;
    setErrorMessage("");
    if (editando && (!dadosIniciais || gerenteCarregadoId !== gerenteId)) {
      setErrorMessage("Os dados do gerente não foram carregados. Recarregue antes de editar.");
      return;
    }

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if ((data.senha || data.confirmacaoSenha) && data.senha !== data.confirmacaoSenha) {
      setErrorMessage("As senhas informadas não coincidem.");
      return;
    }
    if (data.senha && data.senha.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    const valores = {
      nome: String(data.nome || "").trim(),
      email: String(data.email || "").trim(),
      telefone: String(data.telefone || "").trim(),
      estacionamentoId: vinculoSelecionado,
    };
    if (!valores.nome || !valores.email) {
      setErrorMessage("Nome e e-mail são obrigatórios.");
      return;
    }

    // PATCH envia apenas alterações reais, preservando campos não editados.
    const camposAlterados = editando ? Object.keys(valores).filter((campo) =>
      normalizarCampo(campo, valores[campo]) !== normalizarCampo(campo, dadosIniciais[campo])
    ) : Object.keys(valores);
    const payload = Object.fromEntries(camposAlterados.map((campo) => [campo, valores[campo]]));
    if (data.senha) payload.senha = data.senha;
    if (editando && camposAlterados.length === 0 && !data.senha) {
      setErrorMessage("Nenhuma alteração foi feita nos dados do gerente.");
      return;
    }
    if (!editando) {
      payload.tipo_user = "admin";
      payload.cargo = "Gerente";
      if (!payload.senha) {
        setErrorMessage("A senha provisória é obrigatória para novos cadastros.");
        return;
      }
    }

    envioEmAndamento.current = true;
    setSubmitting(true);
    let confirmando = false;
    try {
      if (editando) {
        await apiService.atualizarGerente(gerenteId, payload);
        confirmando = true;
        const salvo = await apiService.getGerentePorId(gerenteId);
        if (!salvo || typeof salvo !== "object" || Array.isArray(salvo)) {
          throw new Error("A API retornou dados inválidos na conferência.");
        }
        const divergentes = camposAlterados.filter((campo) =>
          normalizarCampo(campo, salvo[campo]) !== normalizarCampo(campo, valores[campo])
        );
        if (divergentes.length) {
          const rotulos = { nome: "nome", email: "e-mail", telefone: "telefone", estacionamentoId: "vínculo com o estacionamento" };
          setErrorMessage(`A API respondeu à edição, mas não confirmou a gravação de: ${divergentes.map((campo) => rotulos[campo]).join(", ")}. Alguns dados podem ter sido salvos. Confira os detalhes antes de tentar novamente.`);
          return;
        }
        // Senhas não são devolvidas pela API: seu resultado depende do contrato da rota.
        alert("Gerente atualizado com sucesso!");
        navigate(`/gerentes/${gerenteId}`);
      } else {
        await apiService.criarGerente(payload);
        alert("Gerente cadastrado com sucesso!");
        navigate("/gerentes");
      }
    } catch (err) {
      const detalhe = mensagemErro(err, "Falha na comunicação com a API.");
      setErrorMessage(confirmando
        ? `A solicitação de edição foi enviada, mas não foi possível confirmar os dados salvos. ${detalhe} Confira os detalhes antes de tentar novamente.`
        : `${editando ? "Não foi possível concluir a edição do gerente." : "Não foi possível cadastrar o gerente."} ${detalhe}`);
    } finally {
      envioEmAndamento.current = false;
      setSubmitting(false);
    }
  }

  if (editando && (carregandoDados || !dadosIniciais || gerenteCarregadoId !== gerenteId)) {
    return (
      <Layout title="Editar gerente">
        {carregandoDados || !errorMessage ? <p style={{ padding: "20px" }}>Carregando dados do gerente...</p> : (
          <div style={{ padding: "20px" }}>
            <p role="alert">{errorMessage}</p>
            <button type="button" className="vallet-btn-primary" onClick={() => setTentativaCarga((atual) => atual + 1)}>Tentar novamente</button>
            <Link className="vallet-cancel-link" to="/gerentes">Voltar para gerentes</Link>
          </div>
        )}
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

        {erroEstacionamentos && <div role="alert" style={{ marginBottom: "16px", color: "var(--secondary-color, #637365)" }}>
          Não foi possível carregar as opções de estacionamento. {erroEstacionamentos} O vínculo atual será preservado.
        </div>}
        <form key={gerenteId || "novo"} onSubmit={handleSubmit} onReset={() => {
          setVinculoSelecionado(dadosIniciais?.estacionamentoId || "");
          setErrorMessage("");
          setMostrarSenha(false);
          setMostrarConfirmacao(false);
        }}>
          <fieldset disabled={submitting} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          
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
                <select name="estacionamentoId" value={vinculoSelecionado} onChange={(event) => setVinculoSelecionado(event.target.value)} disabled={Boolean(erroEstacionamentos)}>
                  {vinculoSelecionado && !estacionamentos.some((est) => est.id === vinculoSelecionado) && (
                    <option value={vinculoSelecionado}>{dadosIniciais?.estacionamentoNome || "Estacionamento vinculado atualmente"}</option>
                  )}
                  <option value="">Acesso geral (sem vínculo específico)</option>
                  {estacionamentos.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.nome} ({est.cnpj})
                    </option>
                  ))}
                </select>
              </label>

              <label className="vallet-field" style={{ position: "relative", gridColumn: "span 2" }}>
                <span className="vallet-label">
                  {editando ? "Nova senha (deixe em branco para manter)" : "Senha provisória"}
                </span>
                <input
                  name="senha"
                  type={mostrarSenha ? "text" : "password"}
                  minLength="6"
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  required={!editando}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "32px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--secondary-color)",
                    padding: "4px",
                  }}
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </label>
              
              <label className="vallet-field" style={{ position: "relative", gridColumn: "span 2" }}>
                <span className="vallet-label">Confirmar senha</span>
                <input
                  name="confirmacaoSenha"
                  type={mostrarConfirmacao ? "text" : "password"}
                  minLength="6"
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  required={!editando}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "32px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--secondary-color)",
                    padding: "4px",
                  }}
                  title={mostrarConfirmacao ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarConfirmacao ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
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
          </fieldset>
        </form>
      </div>
    </Layout>
  );
}