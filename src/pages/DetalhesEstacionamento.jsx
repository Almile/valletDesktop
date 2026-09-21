import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";

export default function DetalhesEstacionamento() {
  const { estacionamentoId } = useParams();

  return (
    <Layout title="Dados do estacionamento">
      <section className="details-card">
        <header className="details-header">
          <div>
            <div className="details-title-line">
              <h2>Estacionamento Central</h2>
              <span className="status-badge">Ativo</span>
            </div>
            <p>Visualização demonstrativa • Código: {estacionamentoId}</p>
          </div>

          <div className="details-actions">
            <Link className="secondary-button" to="/estacionamentos">
              Voltar
            </Link>
            <button className="primary-button" type="button" disabled>
              Editar dados
            </button>
          </div>
        </header>

        <div className="details-content">
          <section className="details-section">
            <h3>Informações principais</h3>
            <dl className="details-grid">
              <div>
                <dt>Nome</dt>
                <dd>Estacionamento Central</dd>
              </div>
              <div>
                <dt>CNPJ</dt>
                <dd>00.000.000/0000-00</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>(13) 99999-9999</dd>
              </div>
            </dl>
          </section>

          <section className="details-section">
            <h3>Endereço</h3>
            <dl className="details-grid">
              <div className="details-field--wide">
                <dt>Logradouro</dt>
                <dd>Avenida Presidente Kennedy, 1000</dd>
              </div>
              <div>
                <dt>Bairro</dt>
                <dd>Boqueirão</dd>
              </div>
              <div>
                <dt>Cidade</dt>
                <dd>Praia Grande</dd>
              </div>
              <div>
                <dt>UF</dt>
                <dd>SP</dd>
              </div>
              <div>
                <dt>CEP</dt>
                <dd>11700-000</dd>
              </div>
            </dl>
          </section>

          <section className="details-section">
            <h3>Funcionamento e valores</h3>
            <dl className="details-grid details-grid--compact">
              <div>
                <dt>Abertura</dt>
                <dd>08:00</dd>
              </div>
              <div>
                <dt>Fechamento</dt>
                <dd>22:00</dd>
              </div>
              <div>
                <dt>Valor por hora</dt>
                <dd>R$ 10,00</dd>
              </div>
            </dl>
          </section>

          <section className="details-section">
            <h3>Vagas</h3>
            <div className="parking-summary-grid">
              <article>
                <small>Total de vagas</small>
                <strong>50</strong>
              </article>
              <article>
                <small>Vagas disponíveis</small>
                <strong>50</strong>
              </article>
              <article>
                <small>Vagas PCD</small>
                <strong>4</strong>
              </article>
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}
