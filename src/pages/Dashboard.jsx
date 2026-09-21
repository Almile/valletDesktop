import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Dashboard() {
  return (
    <Layout title="Visão geral">
      <section className="welcome-card">
        <div>
          <p className="section-label">OLÁ, ADMINISTRADOR</p>
          <h2>Comece a organizar sua operação</h2>
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
