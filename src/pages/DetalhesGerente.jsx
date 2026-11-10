import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useFeedback } from "../components/Feedback";
import { apiService } from "../services/api";

import "../styles/gerentes.css";

function formatarData(valor) {
  if (!valor) return "-";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoBlock({ label, value }) {
  return (
    <div className="vallet-field">
      <span className="vallet-label">{label}</span>
      <div style={{
        padding: "10px 12px",
        minHeight: "40px",
        background: "var(--bg-main)",
        border: "1px solid var(--border-light)",
        borderRadius: "6px",
        fontSize: "14px",
        color: "var(--text-main)",
        display: "flex",
        alignItems: "center"
      }}>
        {value || "-"}
      </div>
    </div>
  );
}

export default function DetalhesGerente() {
  const { gerenteId } = useParams();
  const { notify, confirm } = useFeedback();
  const [gerente, setGerente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarGerente() {
      setLoading(true);
      setError("");
      try {
        const dados = await apiService.getGerentePorId(gerenteId);
        if (ativo) setGerente(dados);
      } catch (err) {
        if (ativo) setError(err.message || "Não foi possível carregar os dados do gerente.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarGerente();
    return () => { ativo = false; };
  }, [gerenteId]);

  async function desativar_conta(uid) {
    const confirmado = await confirm({
      titulo: "Desativar usuário",
      mensagem: "Tem certeza que deseja desativar este usuário?",
      textoConfirmar: "Desativar",
      perigo: true,
    });
    if (!confirmado) return;
    try {
        await apiService.desativarGerente(uid);
        notify("Usuário desativado com sucesso!");
        setGerente(prev => ({ ...prev, ativo: false }));
      } catch (err) {
        console.warn(err);
        notify("Erro ao desativar usuário.", "error");
      } 
  }

  async function reativar_conta(uid) {
    try {
        await apiService.reativarGerente(uid);
        notify("Usuário reativado com sucesso!");
        setGerente(prev => ({ ...prev, ativo: true }));
      } catch (err) {
        console.warn(err);
        notify("Erro ao reativar usuário.", "error");
      } 
  }

  if (loading) {
    return (
      <Layout title="Detalhes do gerente">
        <p className="vallet-loading-text" role="status">Carregando dados do gerente...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Detalhes do gerente">
      <div className="vallet-form-container">
        
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link 
                to="/gerentes" 
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
              <h2 className="vallet-section-title" style={{ fontSize: "24px", margin: 0 }}>
                {gerente?.nome || "Gerente"}
              </h2>
              {gerente && (
                <span 
                  className="vallet-badge" 
                  style={gerente.ativo !== false ? {color: '#057153', background: '#e6f7f1'} : {color: '#8b2525', background: '#fff0f0'}}
                >
                  {gerente.ativo !== false ? "Ativo" : "Desativado"}
                </span>
              )}
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <Link className="vallet-btn-secondary" to={`/gerentes/${gerenteId}/editar`}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px"}}>
                <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Editar dados
            </Link>
          </div>
        </header>

        {error && (
          <div style={{ color: "#8b2525", backgroundColor: "#fff0f0", padding: "12px", borderRadius: "6px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {gerente && (
          <>
            <div className="vallet-section">
              <h3 className="vallet-section-title" style={{ fontSize: "18px" }}>Informações pessoais</h3>
              <hr className="vallet-divider" />
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <InfoBlock label="Nome completo" value={gerente.nome} />
                </div>
                <InfoBlock label="Cargo" value={gerente.cargo || "Gerente"} />
                
                <div style={{ gridColumn: "span 2" }}>
                  <InfoBlock label="E-mail" value={gerente.email} />
                </div>
                <InfoBlock label="Telefone" value={gerente.telefone} />
              </div>
            </div>

            <div className="vallet-section" style={{ marginBottom: "0" }}>
              <h3 className="vallet-section-title" style={{ fontSize: "18px" }}>Acesso e vínculo</h3>
              <hr className="vallet-divider" />
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <InfoBlock label="Tipo de usuário" value={gerente.tipo_user || "admin"} />
                <InfoBlock label="Data de cadastro" value={formatarData(gerente.data_criacao)} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <InfoBlock label="Estacionamento vinculado" value={gerente.estacionamentoNome || gerente.estacionamentoId || "Acesso Geral (Não vinculado a uma unidade específica)"} />
                </div>
              </div>
            </div>

            <div className="vallet-section" style={{ marginTop: "48px", marginBottom: "8px" }}>
              <hr className="vallet-divider" style={{ borderColor: "#ffcdd2", marginBottom: "16px" }} />
              
              <div className="vallet-danger-zone">
                <div>
                  <strong style={{ display: "block", color: "#c62828", fontSize: "15px", marginBottom: "4px" }}>
                    Desativar acesso do usuário
                  </strong>
                  <span style={{ color: "#c62828", fontSize: "13px", opacity: 0.9 }}>
                    O usuário perderá o acesso ao sistema, mas seus dados e histórico serão mantidos. Estacionamento vinculado: {gerente.estacionamentoNome || "Nenhum"}.
                  </span>
                </div>
                {gerente.ativo !== false ? (
                  <button 
                    className="vallet-btn-danger" 
                    type="button" 
                    onClick={() => desativar_conta(gerente.uid)}
                  >
                    Desativar usuário
                  </button>
                ) : (
                  <button 
                    className="vallet-btn-primary" 
                    style={{ background: "#057153" }} 
                    type="button"
                    onClick={() => reativar_conta(gerente.uid)}
                  >
                    Reativar usuário
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}