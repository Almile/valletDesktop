import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";

export default function DetalhesEstacionamento() {
  const { estacionamentoId } = useParams();
  const [estacionamento, setEstacionamento] = useState(null);
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [availability, setAvailability] = useState("todas");
  const [showModalSingle, setShowModalSingle] = useState(false);
  const [showModalLote, setShowModalLote] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [novaVaga, setNovaVaga] = useState({
    numero: "",
    localizacao: "",
    preco: 0,
    tipo: "Comum",
    preferencial: false,
  });

  const [loteVagas, setLoteVagas] = useState({
    quantidade: 10,
    prefixo: "A-",
    tipo: "Comum",
    preco: 0,
    localizacao: "",
    preferencial: false,
  });

  useEffect(() => {
    carregarDados();
  }, [estacionamentoId]);

  async function carregarDados() {
    try {
      setLoading(true);
      setError("");

      const [estData, vagasData] = await Promise.all([
        apiService.getEstacionamentoPorId(estacionamentoId).catch(() => null),
        apiService.getVagasEstacionamento(estacionamentoId),
      ]);

      if (estData) setEstacionamento(estData);
      setVagas(vagasData || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar os dados do estacionamento.");
    } finally {
      setLoading(false);
    }
  }

  const filteredVacancies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return vagas.filter((vaga) => {
      const matchesSearch =
        !normalizedSearch ||
        (vaga.numero && vaga.numero.toLowerCase().includes(normalizedSearch)) ||
        (vaga.localizacao &&
          vaga.localizacao.toLowerCase().includes(normalizedSearch));

      const matchesCategory = category === "todas" || vaga.tipo === category;

      const isDisponivel = vaga.disponivel ? "Livre" : "Ocupada";
      const matchesAvailability =
        availability === "todas" || isDisponivel === availability;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [availability, category, search, vagas]);

  async function handleCriarVaga(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiService.criarVaga({
        ...novaVaga,
        preco: parseFloat(novaVaga.preco) || 0,
        estacionamentoId,
      });
      setShowModalSingle(false);
      setNovaVaga({
        numero: "",
        localizacao: "",
        preco: 0,
        tipo: "Comum",
        preferencial: false,
      });
      await carregarDados();
    } catch (err) {
      alert(err.message || "Erro ao criar vaga.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCriarLote(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiService.criarVagasEmLote({
        ...loteVagas,
        quantidade: Number(loteVagas.quantidade),
        preco: parseFloat(loteVagas.preco) || 0,
        estacionamentoId,
      });
      setShowModalLote(false);
      await carregarDados();
    } catch (err) {
      alert(err.message || "Erro ao gerar vagas em lote.");
    } finally {
      setSubmitting(false);
    }
  }

  async function excluir_estacionamento(estacionamentoId) {
    try {
        const requisicao = await apiService.excluirEstacionamento(estacionamentoId);
        alert("Estacionamento excluido com sucesso!")
      } catch (err) {
        console.warn(err)
      } 
  }

  async function toggleDisponibilidade(vaga) {
    try {
      await apiService.atualizarVaga(vaga.id, { disponivel: !vaga.disponivel });
      setVagas((prev) =>
        prev.map((v) =>
          v.id === vaga.id ? { ...v, disponivel: !v.disponivel } : v,
        ),
      );
    } catch (err) {
      alert("Erro ao alterar o status da vaga.");
    }
  }

  if (loading) {
    return (
      <Layout title="Dados do estacionamento">
        <p style={{ padding: "20px" }}>Carregando dados do estacionamento...</p>
      </Layout>
    );
  }

  const enderecoObj =
    typeof estacionamento?.endereco === "object" ? estacionamento.endereco : {};

  return (
    <Layout title="Dados do estacionamento">
      <section className="details-card">
        <header className="details-header">
          <div>
            <div className="details-title-line">
              <h2>{estacionamento?.nome || "Estacionamento"}</h2>
              <span className="status-badge">Ativo</span>
            </div>
            <p>Código do sistema: {estacionamentoId}</p>
          </div>

          <div className="details-actions">
            {estacionamento && (
              <Link
                className="primary-link"
                to={`/estacionamentos/${estacionamentoId}/editar`}
              >
                Editar estacionamento
              </Link>
            )}

            <button className="primary-button" type="submit" onClick={()=>{excluir_estacionamento(estacionamentoId)}}>Excluir estacionamento</button>

            <Link className="secondary-button" to="/estacionamentos">
              Voltar
            </Link>
          </div>
        </header>

        {error && (
          <div
            style={{
              color: "red",
              backgroundColor: "#ffe6e6",
              padding: "12px",
              margin: "16px 0",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        <div className="details-content">
          <section className="details-section">
            <h3>Informações principais</h3>
            <dl className="details-grid">
              <div>
                <dt>Nome</dt>
                <dd>{estacionamento?.nome || "-"}</dd>
              </div>
              <div>
                <dt>CNPJ</dt>
                <dd>{estacionamento?.cnpj || "-"}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{estacionamento?.telefone || "-"}</dd>
              </div>
            </dl>
          </section>

          <section className="details-section">
            <h3>Endereço</h3>
            <dl className="details-grid">
              <div className="details-field--wide">
                <dt>Logradouro</dt>
                <dd>
                  {[
                    enderecoObj.logradouro ||
                      (typeof estacionamento?.endereco === "string"
                        ? estacionamento.endereco
                        : ""),
                    enderecoObj.numero,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </dd>
              </div>
              <div>
                <dt>Complemento</dt>
                <dd>{enderecoObj.complemento || "-"}</dd>
              </div>
              <div>
                <dt>Bairro</dt>
                <dd>{enderecoObj.bairro || "-"}</dd>
              </div>
              <div>
                <dt>Cidade</dt>
                <dd>
                  {enderecoObj.cidade ||
                    enderecoObj.localidade ||
                    estacionamento?.cidade ||
                    "-"}
                </dd>
              </div>
              <div>
                <dt>UF</dt>
                <dd>{enderecoObj.uf || "-"}</dd>
              </div>
              <div>
                <dt>CEP</dt>
                <dd>{enderecoObj.cep || "-"}</dd>
              </div>
            </dl>
          </section>

          <section className="details-section">
            <h3>Funcionamento e valores</h3>
            <dl className="details-grid details-grid--compact">
              {estacionamento?.funciona24h === true ? (
                <div>
                  <dt>Funcionamento</dt>
                  <dd>24 horas</dd>
                </div>
              ) : (
                <>
                  <div>
                    <dt>Abertura</dt>
                    <dd>{estacionamento?.horarioAbertura || "08:00"}</dd>
                  </div>
                  <div>
                    <dt>Fechamento</dt>
                    <dd>{estacionamento?.horarioFechamento || "18:00"}</dd>
                  </div>
                </>
              )}
              <div>
                <dt>Valor base por hora</dt>
                <dd>
                  R$ {parseFloat(estacionamento?.valorHora || 0).toFixed(2)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="details-section">
            <h3>Vagas</h3>
            <div className="parking-summary-grid">
              <article>
                <small>Total de vagas</small>
                <strong>{vagas.length}</strong>
              </article>
              <article>
                <small>Vagas disponíveis</small>
                <strong>{vagas.filter((v) => v.disponivel).length}</strong>
              </article>
              <article>
                <small>Vagas PCD / Preferenciais</small>
                <strong>
                  {
                    vagas.filter((v) => v.tipo === "IdosoPcd" || v.preferencial)
                      .length
                  }
                </strong>
              </article>
              <article>
                <small>Vagas Ocupadas</small>
                <strong>{vagas.filter((v) => !v.disponivel).length}</strong>
              </article>
            </div>

            <div className="vacancies-panel">
              <header className="vacancies-panel-header">
                <div>
                  <h4>Gestão de vagas</h4>
                  <p>
                    Vagas cadastradas no sistema e disponíveis para reserva.
                  </p>
                </div>

                <div className="vacancies-panel-actions">
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={() => setShowModalLote(true)}
                  >
                    Gerar vagas em lote
                  </button>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => setShowModalSingle(true)}
                  >
                    + Nova vaga
                  </button>
                </div>
              </header>

              <div className="vacancies-toolbar">
                <label className="vacancy-search">
                  <span>Pesquisar vaga</span>
                  <input
                    type="search"
                    placeholder="Número ou localização"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>

                <label className="vacancy-filter">
                  <span>Categoria</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="todas">Todas</option>
                    <option value="Comum">Comum</option>
                    <option value="IdosoPcd">Idoso / PCD</option>
                    <option value="Moto">Moto</option>
                  </select>
                </label>

                <label className="vacancy-filter">
                  <span>Disponibilidade</span>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  >
                    <option value="todas">Todas</option>
                    <option value="Livre">Livre</option>
                    <option value="Ocupada">Ocupada</option>
                  </select>
                </label>
              </div>

              <div className="vacancies-table-wrapper">
                <table className="vacancies-table">
                  <thead>
                    <tr>
                      <th>Vaga</th>
                      <th>Localização</th>
                      <th>Categoria</th>
                      <th>Preço/h</th>
                      <th>Preferencial</th>
                      <th>Disponibilidade</th>
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
                          <td>{vacancy.localizacao || "Padrão"}</td>
                          <td>{vacancy.tipo}</td>
                          <td>
                            R$ {parseFloat(vacancy.preco || 0).toFixed(2)}
                          </td>
                          <td>{vacancy.preferencial ? "Sim" : "Não"}</td>
                          <td>
                            <span
                              className={`vacancy-status vacancy-status--${vacancy.disponivel ? "livre" : "ocupada"}`}
                              style={{
                                cursor: "pointer",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                color: "#fff",
                                backgroundColor: vacancy.disponivel
                                  ? "#28a745"
                                  : "#dc3545",
                              }}
                              onClick={() => toggleDisponibilidade(vacancy)}
                              title="Clique para alterar status"
                            >
                              {vacancy.disponivel ? "Livre" : "Ocupada"}
                            </span>
                          </td>
                          <td className="vacancy-actions-cell">
                            <button
                              type="button"
                              style={{
                                color: "red",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                              }}
                              onClick={async () => {
                                if (
                                  confirm(
                                    `Deseja excluir a vaga ${vacancy.numero}?`,
                                  )
                                ) {
                                  await apiService.excluirVaga(vacancy.id);
                                  carregarDados();
                                }
                              }}
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="vacancies-no-results" colSpan="7">
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

      {showModalSingle && (
        <div style={modalOverlayStyle}>
          <div style={modalBodyStyle}>
            <h3>Cadastrar Nova Vaga</h3>
            <form onSubmit={handleCriarVaga}>
              <div style={formGroupStyle}>
                <label>Número/Identificador da Vaga:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: A-01, Vaga 12"
                  value={novaVaga.numero}
                  onChange={(e) =>
                    setNovaVaga({ ...novaVaga, numero: e.target.value })
                  }
                />
              </div>
              <div style={formGroupStyle}>
                <label>Localização / Setor:</label>
                <input
                  type="text"
                  placeholder="Ex: Piso 1, Setor Norte"
                  value={novaVaga.localizacao}
                  onChange={(e) =>
                    setNovaVaga({ ...novaVaga, localizacao: e.target.value })
                  }
                />
              </div>
              <div style={formGroupStyle}>
                <label>Tipo da Vaga:</label>
                <select
                  value={novaVaga.tipo}
                  onChange={(e) =>
                    setNovaVaga({ ...novaVaga, tipo: e.target.value })
                  }
                >
                  <option value="Comum">Comum</option>
                  <option value="IdosoPcd">Idoso / PCD</option>
                  <option value="Moto">Moto</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                <label>Preço Adicional/Diferenciado (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={novaVaga.preco}
                  onChange={(e) =>
                    setNovaVaga({ ...novaVaga, preco: e.target.value })
                  }
                />
              </div>
              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button type="button" onClick={() => setShowModalSingle(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-button"
                >
                  {submitting ? "Salvando..." : "Salvar Vaga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModalLote && (
        <div style={modalOverlayStyle}>
          <div style={modalBodyStyle}>
            <h3>Gerar Múltiplas Vagas em Lote</h3>
            <form onSubmit={handleCriarLote}>
              <div style={formGroupStyle}>
                <label>Quantidade de vagas:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={loteVagas.quantidade}
                  onChange={(e) =>
                    setLoteVagas({ ...loteVagas, quantidade: e.target.value })
                  }
                />
              </div>
              <div style={formGroupStyle}>
                <label>Prefixo (Ex: "A-" gera A-1, A-2...):</label>
                <input
                  type="text"
                  value={loteVagas.prefixo}
                  onChange={(e) =>
                    setLoteVagas({ ...loteVagas, prefixo: e.target.value })
                  }
                />
              </div>
              <div style={formGroupStyle}>
                <label>Tipo de Vaga:</label>
                <select
                  value={loteVagas.tipo}
                  onChange={(e) =>
                    setLoteVagas({ ...loteVagas, tipo: e.target.value })
                  }
                >
                  <option value="Comum">Comum</option>
                  <option value="IdosoPcd">Idoso / PCD</option>
                  <option value="moto">Moto</option>
                  <option value="carro">Carro</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                <label>Preço:</label>
                <input
                  type="number"
                  required
                  value={loteVagas.preco}
                  onChange={(e) =>
                    setLoteVagas({ ...loteVagas, preco: e.target.value })
                  }
                />
              </div>
              <div style={formGroupStyle}>
                <label>Localização / Setor Padrão:</label>
                <input
                  type="text"
                  placeholder="Ex: Terreno Principal"
                  value={loteVagas.localizacao}
                  onChange={(e) =>
                    setLoteVagas({ ...loteVagas, localizacao: e.target.value })
                  }
                />
              </div>
              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button type="button" onClick={() => setShowModalLote(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-button"
                >
                  {submitting ? "Gerando..." : "Gerar Vagas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalBodyStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "8px",
  maxWidth: "450px",
  width: "100%",
};

const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "12px",
  gap: "4px",
};
