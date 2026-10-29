import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";

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
    if(!window.confirm("Tem certeza que deseja desativar este usuário?")) return;
    try {
        await apiService.desativarGerente(uid);
        alert("Usuário desativado com sucesso!");
        setGerente(prev => ({ ...prev, ativo: false }));
      } catch (err) {
        console.warn(err);
        alert("Erro ao desativar usuário.");
      } 
  }

  async function reativar_conta(uid) {
    try {
        await apiService.reativarGerente(uid);
        alert("Usuário reativado com sucesso!");
        setGerente(prev => ({ ...prev, ativo: true }));
      } catch (err) {
        console.warn(err);
        alert("Erro ao reativar usuário.");
      } 
  }

  if (loading) {
    return (
      <Layout title="Detalhes do gerente">
        <p style={{ padding: "20px" }}>Carregando dados do gerente...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Detalhes do gerente">
      <div className="vallet-form-container">
        
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            <p style={{ margin: "6px 0 0", color: "var(--secondary-color)", fontSize: "14px" }}>
              Identificador (UID): {gerente?.uid || gerenteId}
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <Link className="vallet-btn-secondary" to="/gerentes">
              Voltar
            </Link>
            <Link className="vallet-btn-secondary" style={{ borderColor: "var(--support-mid)", color: "var(--main-color)" }} to={`/gerentes/${gerenteId}/editar`}>
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

            <footer className="vallet-form-footer" style={{ marginTop: "40px" }}>
              {gerente.ativo !== false ? (
                <button 
                  className="vallet-btn-primary" 
                  style={{ background: "#a32121" }} 
                  onClick={() => desativar_conta(gerente.uid)}
                >
                  Desativar acesso do usuário
                </button>
              ) : (
                <button 
                  className="vallet-btn-primary" 
                  style={{ background: "#057153" }} 
                  onClick={() => reativar_conta(gerente.uid)}
                >
                  Reativar acesso do usuário
                </button>
              )}
            </footer>
          </>
        )}
      </div>
    </Layout>
  );
}