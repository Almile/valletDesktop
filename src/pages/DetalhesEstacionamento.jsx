import { useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useFeedback } from "../components/Feedback";
import { apiService } from "../services/api";

import "../styles/estacionamentos.css";

function categoriaVaga(vaga = {}) {
  const tipo = String(vaga.tipo ?? "").trim().toLowerCase().replace(/[\s_/-]/g, "");
  if (vaga.preferencial === true || ["preferencial", "idosopcd", "pcd", "idoso"].includes(tipo)) return "preferencial";
  if (tipo === "moto") return "moto";
  if (["carro", "comum"].includes(tipo)) return "carro";
  return "";
}

function rotuloVaga(vaga) {
  const categoria = categoriaVaga(vaga);
  return ({ carro: "Carro", moto: "Moto", preferencial: "Preferencial" })[categoria] || vaga.tipo || "Tipo não informado";
}

function IconeVaga({ tipo }) {
  const caminhos = {
    editar: <path d="m16 3 5 5M4 16 16 4a2.1 2.1 0 0 1 3 3L7 19l-4 1z" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {caminhos[tipo]}
    </svg>
  );
}

const infoBoxStyle = {
  height: "40px",
  fontSize: "15px",
  padding: "0 12px",
  background: "var(--bg-main)",
  borderRadius: "6px",
  border: "1px solid var(--border-light)",
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis"
};

export default function DetalhesEstacionamento() {
  const { estacionamentoId } = useParams();
  const navigate = useNavigate();
  const { notify, confirm } = useFeedback();
  const [estacionamento, setEstacionamento] = useState(null);
  const [vagas, setVagas] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [availability, setAvailability] = useState("todas");

  useEffect(() => {
    carregarDados();
  }, [estacionamentoId]);

  async function carregarDados() {
    try {
      setLoading(true);
      setError("");
      const [estData, vagasData, adminsData] = await Promise.all([
        apiService.getEstacionamentoPorId(estacionamentoId).catch(() => null),
        apiService.getVagasEstacionamento(estacionamentoId).catch(() => []),
        apiService.getAdmins().catch(() => [])
      ]);
      if (estData) setEstacionamento(estData);
      setVagas(vagasData || []);
      setAdmins(adminsData || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar os dados do estacionamento.");
    } finally {
      setLoading(false);
    }
  }

  const filteredVacancies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return vagas.filter((vaga) => {
      const matchesSearch = !normalizedSearch || (vaga.numero && vaga.numero.toLowerCase().includes(normalizedSearch)) || (vaga.localizacao && vaga.localizacao.toLowerCase().includes(normalizedSearch));
      const matchesCategory = category === "todas" || categoriaVaga(vaga) === category;
      const isDisponivel = vaga.disponivel ? "Livre" : "Ocupada";
      const matchesAvailability = availability === "todas" || isDisponivel === availability;
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [availability, category, search, vagas]);

  async function excluir_estacionamento(estacionamentoId) {
    const confirmado = await confirm({
      titulo: "Excluir estacionamento",
      mensagem: "Deseja realmente excluir este estacionamento? Esta ação não pode ser desfeita.",
      textoConfirmar: "Excluir",
      perigo: true,
    });
    if (!confirmado) return;
    try {
      await apiService.excluirEstacionamento(estacionamentoId);
      notify("Estacionamento excluído com sucesso!");
      navigate("/estacionamentos");
    } catch (err) {
      console.warn(err);
      notify("Erro ao excluir estacionamento.", "error");
    }
  }

  async function toggleDisponibilidade(vaga) {
    try {
      await apiService.atualizarVaga(vaga.id, { disponivel: !vaga.disponivel });
      setVagas((prev) => prev.map((v) => v.id === vaga.id ? { ...v, disponivel: !v.disponivel } : v));
    } catch (err) {
      notify("Erro ao alterar o status da vaga.", "error");
    }
  }

  if (loading) {
    return (
      <Layout title="Dados do estacionamento">
        <div className="vallet-form-container">
          <p className="vallet-loading-text" role="status">
            Carregando dados do estacionamento...
          </p>
        </div>
      </Layout>
    );
  }

  const enderecoObj = typeof estacionamento?.endereco === "object" ? estacionamento.endereco : {};
  
  const adminResp = admins.find(adm => adm.uid === estacionamento?.adminUid || adm.id === estacionamento?.adminUid);
  const adminName = adminResp?.nome || adminResp?.email
    || estacionamento?.adminNome || estacionamento?.adminEmail || "-";

  return (
    <Layout title="Dados do estacionamento">
      <div className="vallet-form-container">
        
        <header className="vallet-details-header" style={{ alignItems: "center" }}>
          <div className="vallet-details-title-group" style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
            <Link 
              to="/estacionamentos" 
              title="Voltar" 
              aria-label="Voltar" 
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center', 
                color: 'var(--text-main)', 
                textDecoration: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--surface)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="vallet-details-title" style={{ margin: 0 }}>
              {estacionamento?.nome || "Estacionamento"}
            </h2>
          </div>

          <div className="vallet-details-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {estacionamento && (
              <Link className="vallet-btn-secondary" to={`/estacionamentos/${estacionamentoId}/editar`}>
                <IconeVaga tipo="editar" />
                Editar Informações e Vagas
              </Link>
            )}
          </div>
        </header>

        {error && <div role="alert" className="vallet-error-banner">{error}</div>}

        <div className="vallet-section">
          <div className="vallet-layout-split">
            <div className="vallet-layout-left">
              
              <div className="vallet-form-line">
                <div className="vallet-field" style={{ gridColumn: "span 5" }}>
                  <span className="vallet-label">Nome</span>
                  <div style={infoBoxStyle}>{estacionamento?.nome || "-"}</div>
                </div>
                <div className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">CNPJ</span>
                  <div style={infoBoxStyle}>{estacionamento?.cnpj || "-"}</div>
                </div>
                <div className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">Telefone</span>
                  <div style={infoBoxStyle}>{estacionamento?.telefone || "-"}</div>
                </div>
              </div>

              <div className="vallet-form-line">
                <div className="vallet-field" style={{ gridColumn: "span 6" }}>
                  <span className="vallet-label">Administrador</span>
                  <div style={infoBoxStyle}>{adminName}</div>
                </div>
                <div className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">CEP</span>
                  <div style={infoBoxStyle}>{enderecoObj?.cep || "-"}</div>
                </div>
                <div className="vallet-field" style={{ gridColumn: "span 1" }}>
                  <span className="vallet-label">UF</span>
                  <div style={infoBoxStyle}>{enderecoObj?.uf || "-"}</div>
                </div>
              </div>

              <div className="vallet-form-line">
                <div className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">Cidade</span>
                  <div style={infoBoxStyle}>
                    {enderecoObj?.cidade || enderecoObj?.localidade || estacionamento?.cidade || "-"}
                  </div>
                </div>
                <div className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">Bairro</span>
                  <div style={infoBoxStyle}>{enderecoObj?.bairro || "-"}</div>
                </div>
                <div className="vallet-field" style={{ gridColumn: "span 4" }}>
                  <span className="vallet-label">Logradouro</span>
                  <div style={infoBoxStyle}>
                    {enderecoObj?.logradouro || (typeof estacionamento?.endereco === "string" ? estacionamento.endereco : "") || "-"}
                  </div>
                </div>
                <div className="vallet-field" style={{ gridColumn: "span 1" }}>
                  <span className="vallet-label">Número</span>
                  <div style={infoBoxStyle}>{enderecoObj?.numero || "-"}</div>
                </div>
              </div>

            </div>

            <div className="vallet-photo-area">
              <span className="vallet-label">Foto do Estacionamento</span>
              <div className="vallet-photo-box">
                {estacionamento?.fotoEstacionamentoUri ? (
                  <img src={estacionamento.fotoEstacionamentoUri} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div className="vallet-photo-dropzone">
                    <p className="muted" style={{ fontSize: "13px" }}>Nenhuma foto</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="vallet-section">
          <h3 className="vallet-section-title">Funcionamento e valores</h3>
          <hr className="vallet-divider" />
          <div className="vallet-form-line">
            <div className="vallet-field" style={{ gridColumn: "span 3" }}>
              <span className="vallet-label">Valor por hora</span>
              <div style={infoBoxStyle}>
                {parseFloat(estacionamento?.valorHora || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
            <div className="vallet-field" style={{ gridColumn: "span 2" }}>
              <span className="vallet-label">Abertura</span>
              <div style={infoBoxStyle}>
                {estacionamento?.funciona24h ? "24h" : estacionamento?.horarioAbertura || "-"}
              </div>
            </div>
            <div className="vallet-field" style={{ gridColumn: "span 2" }}>
              <span className="vallet-label">Fechamento</span>
              <div style={infoBoxStyle}>
                {estacionamento?.funciona24h ? "24h" : estacionamento?.horarioFechamento || "-"}
              </div>
            </div>
            <div className="vallet-field" style={{ gridColumn: "span 3" }}>
              <span className="vallet-label">Status 24h</span>
              <div style={infoBoxStyle}>
                {estacionamento?.funciona24h ? "Sim" : "Não"}
              </div>
            </div>
          </div>
        </div>

        <div className="vallet-section">
          <h3 className="vallet-section-title">Gestão de vagas</h3>
          <hr className="vallet-divider" />

          <div className="vallet-grid-cards">
            <div className="vallet-card-resumo">
              <div className="vallet-label vallet-card-label">Total de vagas</div>
              <div className="vallet-card-value">{vagas.length}</div>
            </div>
            <div className="vallet-card-resumo">
              <div className="vallet-label vallet-card-label">Disponíveis</div>
              <div className="vallet-card-value">{vagas.filter((v) => v.disponivel).length}</div>
            </div>
            <div className="vallet-card-resumo">
              <div className="vallet-label vallet-card-label">Preferenciais</div>
              <div className="vallet-card-value">{vagas.filter((v) => categoriaVaga(v) === "preferencial").length}</div>
            </div>
            <div className="vallet-card-resumo">
              <div className="vallet-label vallet-card-label">Ocupadas</div>
              <div className="vallet-card-value">{vagas.filter((v) => !v.disponivel).length}</div>
            </div>
          </div>

          <div className="vallet-grid-row-3 vallet-filter-bar">
            <label className="vallet-field vallet-field--wide">
              <span className="vallet-label">Pesquisar vaga</span>
              <input type="search" placeholder="Número ou localização" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <label className="vallet-field">
              <span className="vallet-label">Categoria</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="todas">Todas</option>
                <option value="carro">Carro</option>
                <option value="moto">Moto</option>
                <option value="preferencial">Preferencial</option>
              </select>
            </label>
            <label className="vallet-field">
              <span className="vallet-label">Disponibilidade</span>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option value="todas">Todas</option>
                <option value="Livre">Livre</option>
                <option value="Ocupada">Ocupada</option>
              </select>
            </label>
          </div>

          <div className="vallet-table-wrapper">
            <table className="vallet-table">
              <thead>
                <tr>
                  <th>Vaga</th>
                  <th>Localização</th>
                  <th>Categoria</th>
                  <th>Preço/h</th>
                  <th>Preferencial</th>
                  <th>Disponibilidade</th>
                </tr>
              </thead>
              <tbody>
                {filteredVacancies.length ? (
                  filteredVacancies.map((vacancy) => (
                    <tr key={vacancy.id}>
                      <td><strong>{vacancy.numero}</strong></td>
                      <td>{vacancy.localizacao || "Padrão"}</td>
                      <td>{rotuloVaga(vacancy)}</td>
                      <td>R$ {parseFloat(vacancy.preco || 0).toFixed(2)}</td>
                      <td>{categoriaVaga(vacancy) === "preferencial" ? "Sim" : "Não"}</td>
                      <td>
                        <button type="button" className="vallet-status-btn" onClick={() => toggleDisponibilidade(vacancy)} title="Clique para alterar status">
                          <span className={`vallet-badge ${vacancy.disponivel ? 'vallet-badge-livre' : 'vallet-badge-ocupada'}`}>
                            {vacancy.disponivel ? "Livre" : "Ocupada"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="vallet-empty-row" colSpan="6">Nenhuma vaga encontrada com esses filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* NOVA ZONA DE PERIGO ADICIONADA AO FINAL */}
        <div className="vallet-section" style={{ marginTop: "48px", marginBottom: "8px" }}>
          <hr className="vallet-divider" style={{ borderColor: "#ffcdd2", marginBottom: "16px" }} />
          
          <div className="vallet-danger-zone">
            <div>
              <strong style={{ display: "block", color: "#c62828", fontSize: "15px", marginBottom: "4px" }}>
                Deseja excluir este estacionamento?
              </strong>
              <span style={{ color: "#c62828", fontSize: "13px", opacity: 0.9 }}>
                Uma vez excluído, não será possível recuperar os dados, o histórico de vagas e administradores atrelados.
              </span>
            </div>
            <button 
              className="vallet-btn-danger" 
              type="button" 
              onClick={() => excluir_estacionamento(estacionamentoId)}
            >
              Excluir estacionamento
            </button>
          </div>
        </div>
        
      </div>
    </Layout>
  );
}