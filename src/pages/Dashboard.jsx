import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    estacionamentos: 0,
    gerentes: 0,
    vagas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setLoading(true);

        const [perfil, listaEstacionamentos, listaGerentes] = await Promise.all([
          apiService.getPerfil(),
          apiService.getEstacionamentos().catch(() => []),
          apiService.getGerentes().catch(() => []),
        ]);

        setAdmin(perfil);

        const totalVagas = (Array.isArray(listaEstacionamentos) ? listaEstacionamentos : [])
          .reduce((acc, est) => acc + (Number(est?.quantidadeVagasTotal) || 0), 0);

        setStats({
          estacionamentos: listaEstacionamentos?.length || 0,
          gerentes: listaGerentes?.length || 0,
          vagas: totalVagas,
        });
      } catch (err) {
        console.error("Erro ao carregar dados do Dashboard:", err);
        setError("Não foi possível carregar todas as informações do painel.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  return (
    <Layout title="Visão geral">
      <section className="welcome-card">
        <div>
          <p className="section-label">
            {loading ? "CARREGANDO..." : `OLÁ, ${admin?.nome?.toUpperCase() || "ADMINISTRADOR"}`}
          </p>
          <h2>
            {loading ? "Carregando informações..." : `Bem-vindo(a), ${admin?.nome || "Administrador"}`}
          </h2>
          <p>
            {stats.estacionamentos === 0
              ? "Cadastre o primeiro estacionamento e depois adicione os gerentes responsáveis."
              : "Acompanhe o resumo do sistema e gerencie suas unidades e colaboradores."}
          </p>
        </div>
        <Link className="light-button" to="/estacionamentos/novo">
          Cadastrar estacionamento
        </Link>
      </section>

      {error && (
        <div style={{ color: "#721c24", backgroundColor: "#f8d7da", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <section className="statistics-grid">
        <article>
          <i>▣</i>
          <div>
            <small>Estacionamentos</small>
            <strong>{loading ? "..." : stats.estacionamentos}</strong>
          </div>
        </article>
        <article>
          <i>♙</i>
          <div>
            <small>Gerentes</small>
            <strong>{loading ? "..." : stats.gerentes}</strong>
          </div>
        </article>
        <article>
          <i>P</i>
          <div>
            <small>Total de vagas</small>
            <strong>{loading ? "..." : stats.vagas}</strong>
          </div>
        </article>
      </section>

      <section className="management-grid">
        <article>
          <i>▣</i>
          <div>
            <h2>Estacionamentos</h2>
            <p>Cadastre unidades, horários, valores e a quantidade de vagas.</p>
            <Link className="secondary-button" to="/estacionamentos">
              Gerenciar estacionamentos
            </Link>
          </div>
        </article>
        <article>
          <i>♙</i>
          <div>
            <h2>Gerentes</h2>
            <p>
              Adicione gerentes e vincule cada profissional ao seu
              estacionamento.
            </p>
            <Link className="secondary-button" to="/gerentes">
              Gerenciar equipe
            </Link>
          </div>
        </article>
      </section>
    </Layout>
  );
}