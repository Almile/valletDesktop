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

  if (loading) {
    return (
      <Layout title="Detalhes do gerente">
        <p style={{ padding: "20px" }}>Carregando dados do gerente...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Detalhes do gerente">
      <section className="details-card">
        <header className="details-header">
          <div>
            <div className="details-title-line">
              <h2>{gerente?.nome || "Gerente"}</h2>
              {gerente && <span className="status-badge">{gerente.cargo || "Gerente"}</span>}
            </div>
            <p>Identificador do sistema: {gerente?.uid || gerenteId}</p>
          </div>
          <div className="details-actions">
            <Link className="secondary-button" to="/gerentes">Voltar para gerentes</Link>
          </div>
        </header>

        {error && (
          <div style={{ color: "#a32121", backgroundColor: "#ffe6e6", padding: "12px", margin: "16px 24px", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        {gerente && (
          <div className="details-content">
            <section className="details-section">
              <h3>Informações pessoais</h3>
              <dl className="details-grid">
                <div>
                  <dt>Nome completo</dt>
                  <dd>{gerente.nome || "-"}</dd>
                </div>
                <div>
                  <dt>Cargo</dt>
                  <dd>{gerente.cargo || "Gerente"}</dd>
                </div>
                <div>
                  <dt>Telefone</dt>
                  <dd>{gerente.telefone || "-"}</dd>
                </div>
                <div className="details-field--wide">
                  <dt>E-mail</dt>
                  <dd>{gerente.email || "-"}</dd>
                </div>
              </dl>
            </section>

            <section className="details-section">
              <h3>Acesso e vínculo</h3>
              <dl className="details-grid">
                <div>
                  <dt>Tipo de usuário</dt>
                  <dd>{gerente.tipo_user || "admin"}</dd>
                </div>
                <div>
                  <dt>Estacionamento vinculado</dt>
                  <dd>{gerente.estacionamentoNome || gerente.estacionamentoId || "Não informado"}</dd>
                </div>
                <div>
                  <dt>Data de cadastro</dt>
                  <dd>{formatarData(gerente.data_criacao)}</dd>
                </div>
                <div className="details-field--wide">
                  <dt>UID</dt>
                  <dd>{gerente.uid || gerenteId}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </section>
    </Layout>
  );
}
