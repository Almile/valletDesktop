import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";

const sampleVacancies = [
  {
    id: "vaga-e1",
    numero: "E1",
    piso: "Piso 1",
    veiculo: "Carro",
    categoria: "Comum",
    preco: "R$ 20,00",
    disponibilidade: "Livre",
    sensor: "Conectado",
  },
  {
    id: "vaga-d1",
    numero: "D1",
    piso: "Piso 1",
    veiculo: "Carro",
    categoria: "PCD",
    preco: "R$ 20,00",
    disponibilidade: "Ocupada",
    sensor: "Conectado",
  },
  {
    id: "vaga-b1",
    numero: "B1",
    piso: "Piso 1",
    veiculo: "Moto",
    categoria: "Comum",
    preco: "R$ 12,00",
    disponibilidade: "Manutenção",
    sensor: "Desconectado",
  },
];

export default function DetalhesEstacionamento() {
  const { estacionamentoId } = useParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [availability, setAvailability] = useState("todas");

  const filteredVacancies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sampleVacancies.filter((vacancy) => {
      const matchesSearch =
        !normalizedSearch ||
        vacancy.numero.toLowerCase().includes(normalizedSearch) ||
        vacancy.piso.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        category === "todas" || vacancy.categoria === category;
      const matchesAvailability =
        availability === "todas" || vacancy.disponibilidade === availability;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [availability, category, search]);

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
                <dt>Complemento</dt>
                <dd>Próximo ao shopping</dd>
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
                <dt>Valor base por hora</dt>
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
              <article>
                <small>Vagas para idosos</small>
                <strong>3</strong>
              </article>
            </div>

            <div className="vacancies-panel">
              <header className="vacancies-panel-header">
                <div>
                  <h4>Gestão de vagas</h4>
                  <p>
                    Visualização demonstrativa baseada nas vagas cadastradas no
                    aplicativo.
                  </p>
                </div>

                <div className="vacancies-panel-actions">
                  <button className="secondary-action" type="button" disabled>
                    Gerar vagas em lote
                  </button>
                  <button className="primary-button" type="button" disabled>
                    + Nova vaga
                  </button>
                </div>
              </header>

              <div className="vacancies-toolbar">
                <label className="vacancy-search">
                  <span>Pesquisar vaga</span>
                  <input
                    type="search"
                    placeholder="Número ou piso"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>

                <label className="vacancy-filter">
                  <span>Categoria</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="todas">Todas</option>
                    <option value="Comum">Comum</option>
                    <option value="PCD">PCD</option>
                    <option value="Idoso">Idoso</option>
                  </select>
                </label>

                <label className="vacancy-filter">
                  <span>Disponibilidade</span>
                  <select
                    value={availability}
                    onChange={(event) => setAvailability(event.target.value)}
                  >
                    <option value="todas">Todas</option>
                    <option value="Livre">Livre</option>
                    <option value="Ocupada">Ocupada</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
                </label>
              </div>

              <div className="vacancies-table-wrapper">
                <table className="vacancies-table">
                  <thead>
                    <tr>
                      <th>Vaga</th>
                      <th>Piso</th>
                      <th>Veículo</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>Disponibilidade</th>
                      <th>Sensor</th>
                      <th aria-label="Ações" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVacancies.length ? (
                      filteredVacancies.map((vacancy) => (
                        <tr key={vacancy.id}>
                          <td>
                            <strong className="vacancy-number">
                              {vacancy.numero}
                            </strong>
                          </td>
                          <td>{vacancy.piso}</td>
                          <td>{vacancy.veiculo}</td>
                          <td>{vacancy.categoria}</td>
                          <td>{vacancy.preco}</td>
                          <td>
                            <span
                              className={`vacancy-status vacancy-status--${vacancy.disponibilidade.toLowerCase()}`}
                            >
                              {vacancy.disponibilidade}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`sensor-status sensor-status--${vacancy.sensor.toLowerCase()}`}
                            >
                              {vacancy.sensor}
                            </span>
                          </td>
                          <td className="vacancy-actions-cell">
                            <button type="button" disabled>
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="vacancies-no-results" colSpan="8">
                          Nenhuma vaga encontrada com esses filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}
