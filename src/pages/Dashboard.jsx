import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const perfil = await apiService.getPerfil();
        setAdmin(perfil);
      } catch (err) {
        console.error("Erro ao carregar dados do admin:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarPerfil();
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
            Cadastre o primeiro estacionamento e depois adicione os gerentes
            responsáveis.
          </p>
        </div>
        <Link className="light-button" to="/estacionamentos/novo">
          Cadastrar estacionamento
        </Link>
      </section>

      <section className="statistics-grid">
        <article>
          <i>▣</i>
          <div>
            <small>Estacionamentos</small>
            <strong>0</strong>
          </div>
        </article>
        <article>
          <i>♙</i>
          <div>
            <small>Gerentes</small>
            <strong>0</strong>
          </div>
        </article>
        <article>
          <i>P</i>
          <div>
            <small>Total de vagas</small>
            <strong>0</strong>
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
