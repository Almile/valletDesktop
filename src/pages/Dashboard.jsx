import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import parkingIcon from "../assets/parking.png";
import personIcon  from "../assets/person.png";
import spotIcon    from "../assets/spot.png";

const iconeStyle = (url) => ({
  WebkitMask: `url(${url}) center / contain no-repeat`,
  mask:       `url(${url}) center / contain no-repeat`,
});

export default function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    estacionamentos: 0,
    gerentes: 0,
    vagas: 0,
  });
  
  const [recentesEstacionamentos, setRecentesEstacionamentos] = useState([]);
  const [recentesGerentes, setRecentesGerentes] = useState([]);
  
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
        
        const ests = Array.isArray(listaEstacionamentos) ? listaEstacionamentos : [];
        const gers = Array.isArray(listaGerentes) ? listaGerentes : [];

        const totalVagas = ests.reduce((acc, est) => acc + (Number(est?.quantidadeVagasTotal) || 0), 0);

        setStats({
          estacionamentos: ests.length,
          gerentes: gers.length,
          vagas: totalVagas,
        });

        const obterTempo = (item) => {
          const campoData = item.data_criacao || item.criadoEm || item.createdAt || item.dataCriacao;
          if (!campoData) return 0;
          if (typeof campoData.toMillis === "function") return campoData.toMillis();
          if (typeof campoData.toDate === "function") return campoData.toDate().getTime();
          if (typeof campoData === "object" && typeof campoData.seconds === "number") {
            return campoData.seconds * 1000;
          }
          const t = new Date(campoData).getTime();
          return Number.isNaN(t) ? 0 : t;
        };

        // Estacionamentos com ordenação robusta (Data + ID do Firebase)
        const estsOrdenados = [...ests].sort((a, b) => {
          const tempoA = obterTempo(a);
          const tempoB = obterTempo(b);
          if (tempoA !== tempoB) return tempoB - tempoA;
          return String(b.id || "").localeCompare(String(a.id || ""));
        });
        setRecentesEstacionamentos(estsOrdenados.slice(0, 3));

        // Gerentes ordenados por data
        const gerentesOrdenados = [...gers].sort((a, b) => obterTempo(b) - obterTempo(a));
        setRecentesGerentes(gerentesOrdenados.slice(0, 3));

      } catch (err) {
        console.error("Erro ao carregar dados do Dashboard:", err);
        setError("Não foi possível carregar todas as informações do painel.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    carregarDashboard();
  }, [navigate]);

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
          <i style={iconeStyle(parkingIcon)}></i>
          <div>
            <small>Estacionamentos</small>
            <strong>{loading ? "..." : stats.estacionamentos}</strong>
          </div>
        </article>

        <article>
          <i style={iconeStyle(personIcon)}></i>
          <div>
            <small>Gerentes</small>
            <strong>{loading ? "..." : stats.gerentes}</strong>
          </div>
        </article>

        <article>
          <i style={iconeStyle(spotIcon)}></i>
          <div>
            <small>Total de vagas</small>
            <strong>{loading ? "..." : stats.vagas}</strong>
          </div>
        </article>
      </section>

      <section className="recent-grid">
        <div className="recent-card">
          <header className="recent-header">
            <h2>Estacionamentos Recentes</h2>
            <Link to="/estacionamentos" className="see-all-link">Ver todos</Link>
          </header>
          {loading ? (
             <p className="recent-empty">Carregando...</p>
          ) : recentesEstacionamentos.length > 0 ? (
            <ul className="recent-list">
              {recentesEstacionamentos.map(est => (
                <li key={est.id || est.cnpj} className="recent-item">
                  <div className="recent-info">
                    <strong>{est.nome}</strong>
                    <small>{est.cnpj}</small>
                  </div>
                  <Link to={`/estacionamentos/${est.id}`} className="recent-action">Detalhes</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="recent-empty">Nenhum estacionamento cadastrado.</p>
          )}
        </div>

        <div className="recent-card">
           <header className="recent-header">
            <h2>Gerentes Recentes</h2>
            <Link to="/gerentes" className="see-all-link">Ver todos</Link>
          </header>
          {loading ? (
             <p className="recent-empty">Carregando...</p>
          ) : recentesGerentes.length > 0 ? (
            <ul className="recent-list">
              {recentesGerentes.map(ger => (
                <li key={ger.uid || ger.email} className="recent-item">
                  <div className="recent-info">
                    <strong>{ger.nome || "Sem nome"}</strong>
                    <small>{ger.email}</small>
                  </div>
                  <Link to={`/gerentes/${ger.uid}`} className="recent-action">Detalhes</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="recent-empty">Nenhum gerente cadastrado.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}