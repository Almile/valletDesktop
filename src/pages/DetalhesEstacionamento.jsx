import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";

function IconeVaga({ tipo }) {
  const caminhos = {
    editar: (
      <path d="m16 3 5 5M4 16 16 4a2.1 2.1 0 0 1 3 3L7 19l-4 1z" />
    ),
    excluir: (
      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
    ),
    adicionar: <path d="M12 5v14M5 12h14" />,
    lote: (
      <path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" />
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {caminhos[tipo]}
    </svg>
  );
}

export default function DetalhesEstacionamento() {
  const { estacionamentoId } = useParams();
  const navigate = useNavigate();
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

  const dialogSingleRef = useRef(null);
  const dialogLoteRef = useRef(null);

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

  // Controle do Modal Individual
  useEffect(() => {
    if (showModalSingle && dialogSingleRef.current && !dialogSingleRef.current.open) {
      dialogSingleRef.current.showModal();
    } else if (!showModalSingle && dialogSingleRef.current?.open) {
      dialogSingleRef.current.close();
    }
  }, [showModalSingle]);

  // Controle do Modal em Lote
  useEffect(() => {
    if (showModalLote && dialogLoteRef.current && !dialogLoteRef.current.open) {
      dialogLoteRef.current.showModal();
    } else if (!showModalLote && dialogLoteRef.current?.open) {
      dialogLoteRef.current.close();
    }
  }, [showModalLote]);

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
    if (!window.confirm("Deseja realmente excluir este estacionamento? Esta ação não pode ser desfeita.")) return;
    try {
      await apiService.excluirEstacionamento(estacionamentoId);
      alert("Estacionamento excluído com sucesso!");
      navigate("/estacionamentos");
    } catch (err) {
      console.warn(err);
      alert("Erro ao excluir estacionamento.");
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
        <div className="vallet-form-container">
          <p>Carregando dados do estacionamento...</p>
        </div>
      </Layout>
    );
  }

  const enderecoObj =
    typeof estacionamento?.endereco === "object" ? estacionamento.endereco : {};

  return (
    <Layout title="Dados do estacionamento">
      <div className="vallet-form-container">
        
        {/* Cabeçalho de Ações e Título */}
        <header style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>

                {estacionamento.fotoEstacionamentoUri ? (
                    <img
                      src={estacionamento.fotoEstacionamentoUri}
                      alt={estacionamento.nome}
                      style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  ) : (
                    <span>Sem foto</span>
                  )}

              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: "var(--text-main)" }}>
                {estacionamento?.nome || "Estacionamento"}
              </h2>
              <span className="vallet-badge" style={{ color: "#057153", background: "#e6f7f1" }}>Ativo</span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary-color)" }}>
              Código do sistema: {estacionamentoId}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button 
              className="vallet-btn-clear" 
              type="button" 
              onClick={() => excluir_estacionamento(estacionamentoId)}
            >
              Excluir estacionamento
            </button>
            {estacionamento && (
              <Link
                className="vallet-btn-secondary"
                to={`/estacionamentos/${estacionamentoId}/editar`}
                style={{ textDecoration: "none" }}
              >
                Editar
              </Link>
            )}
            <Link className="vallet-cancel-link" to="/estacionamentos" style={{ marginLeft: "12px" }}>
              Voltar
            </Link>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            style={{
              color: "#8b2525",
              backgroundColor: "#fff0f0",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* Informações Principais */}
        <div className="vallet-section">
          <h3 className="vallet-section-title">Informações principais</h3>
          <hr className="vallet-divider" />
          <div className="vallet-grid-row-1">
            <div className="vallet-field">
              <span className="vallet-label">Nome</span>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>{estacionamento?.nome || "-"}</div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">CNPJ</span>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>{estacionamento?.cnpj || "-"}</div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">Telefone</span>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>{estacionamento?.telefone || "-"}</div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="vallet-section">
          <h3 className="vallet-section-title">Endereço</h3>
          <hr className="vallet-divider" />
          <div className="vallet-grid-row-3">
            <div className="vallet-field">
              <span className="vallet-label">Logradouro</span>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>
                {[
                  enderecoObj.logradouro ||
                    (typeof estacionamento?.endereco === "string"
                      ? estacionamento.endereco
                      : ""),
                  enderecoObj.numero,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">CEP</span>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>{enderecoObj.cep || "-"}</div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">Bairro</span>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>{enderecoObj.bairro || "-"}</div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">Cidade / UF</span>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>
                {enderecoObj.cidade || enderecoObj.localidade || estacionamento?.cidade || "-"} - {enderecoObj.uf || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Funcionamento e Valores */}
        <div className="vallet-section">
          <h3 className="vallet-section-title">Funcionamento e valores</h3>
          <hr className="vallet-divider" />
          <div className="vallet-grid-operation" style={{ alignItems: "start" }}>
            <div className="vallet-field">
              <span className="vallet-label">Valor base por hora</span>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>
                R$ {parseFloat(estacionamento?.valorHora || 0).toFixed(2)}
              </div>
            </div>
            
            {estacionamento?.funciona24h === true ? (
              <div className="vallet-field" style={{ gridColumn: "span 2" }}>
                <span className="vallet-label">Horário</span>
                <div style={{ fontSize: "13px", marginTop: "4px" }}>Funciona 24 horas</div>
              </div>
            ) : (
              <>
                <div className="vallet-field">
                  <span className="vallet-label">Abertura</span>
                  <div style={{ fontSize: "13px", marginTop: "4px" }}>{estacionamento?.horarioAbertura || "08:00"}</div>
                </div>
                <div className="vallet-field">
                  <span className="vallet-label">Fechamento</span>
                  <div style={{ fontSize: "13px", marginTop: "4px" }}>{estacionamento?.horarioFechamento || "18:00"}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Vagas (Gestão e Listagem) */}
        <div className="vallet-section">
          <h3 className="vallet-section-title">Gestão de vagas</h3>
          <hr className="vallet-divider" />

          {/* Cards de Resumo */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div style={{ padding: "16px", background: "var(--support-light)", borderRadius: "8px" }}>
              <div className="vallet-label" style={{ color: "var(--secondary-color)" }}>Total de vagas</div>
              <div style={{ fontSize: "28px", fontWeight: "600", color: "var(--main-color)", marginTop: "4px" }}>{vagas.length}</div>
            </div>
            <div style={{ padding: "16px", background: "var(--support-light)", borderRadius: "8px" }}>
              <div className="vallet-label" style={{ color: "var(--secondary-color)" }}>Disponíveis</div>
              <div style={{ fontSize: "28px", fontWeight: "600", color: "var(--main-color)", marginTop: "4px" }}>{vagas.filter((v) => v.disponivel).length}</div>
            </div>
            <div style={{ padding: "16px", background: "var(--support-light)", borderRadius: "8px" }}>
              <div className="vallet-label" style={{ color: "var(--secondary-color)" }}>PCD / Preferenciais</div>
              <div style={{ fontSize: "28px", fontWeight: "600", color: "var(--main-color)", marginTop: "4px" }}>{vagas.filter((v) => v.tipo === "IdosoPcd" || v.preferencial).length}</div>
            </div>
            <div style={{ padding: "16px", background: "var(--support-light)", borderRadius: "8px" }}>
              <div className="vallet-label" style={{ color: "var(--secondary-color)" }}>Ocupadas</div>
              <div style={{ fontSize: "28px", fontWeight: "600", color: "var(--main-color)", marginTop: "4px" }}>{vagas.filter((v) => !v.disponivel).length}</div>
            </div>
          </div>

          <div className="vallet-vacancies-header">
            <h4 className="vallet-vacancies-title">Lista de vagas</h4>
            <div className="vallet-actions-group">
              <button
                className="vallet-btn-secondary"
                type="button"
                onClick={() => setShowModalLote(true)}
              >
                <IconeVaga tipo="lote" />
                Gerar em lote
              </button>
              <button
                className="vallet-btn-secondary"
                type="button"
                onClick={() => setShowModalSingle(true)}
              >
                <IconeVaga tipo="adicionar" />
                Nova vaga
              </button>
            </div>
          </div>

          {/* Barra de Filtros */}
          <div className="vallet-grid-row-3" style={{ marginBottom: "16px", background: "var(--bg-main)", padding: "16px", borderRadius: "8px" }}>
            <label className="vallet-field" style={{ gridColumn: "span 2" }}>
              <span className="vallet-label">Pesquisar vaga</span>
              <input
                type="search"
                placeholder="Número ou localização"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <label className="vallet-field">
              <span className="vallet-label">Categoria</span>
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

            <label className="vallet-field">
              <span className="vallet-label">Disponibilidade</span>
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

          <div className="vallet-table-wrapper">
            <table className="vallet-table">
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
                        <strong>{vacancy.numero}</strong>
                      </td>
                      <td>{vacancy.localizacao || "Padrão"}</td>
                      <td>{vacancy.tipo === "IdosoPcd" ? "Idoso / PCD" : vacancy.tipo}</td>
                      <td>
                        R$ {parseFloat(vacancy.preco || 0).toFixed(2)}
                      </td>
                      <td>{vacancy.preferencial ? "Sim" : "Não"}</td>
                      <td>
                        <button
                          type="button"
                          style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
                          onClick={() => toggleDisponibilidade(vacancy)}
                          title="Clique para alterar status"
                        >
                          <span
                            className="vallet-badge"
                            style={{
                              color: vacancy.disponivel ? "#057153" : "var(--text-main)",
                              backgroundColor: vacancy.disponivel ? "#e6f7f1" : "var(--border-light)",
                            }}
                          >
                            {vacancy.disponivel ? "Livre" : "Ocupada"}
                          </span>
                        </button>
                      </td>
                      <td>
                        <div className="vallet-row-actions">
                          <button
                            type="button"
                            className="vallet-icon-btn"
                            title="Excluir vaga"
                            onClick={async () => {
                              if (window.confirm(`Deseja excluir a vaga ${vacancy.numero}?`)) {
                                await apiService.excluirVaga(vacancy.id);
                                carregarDados();
                              }
                            }}
                          >
                            <IconeVaga tipo="excluir" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="vallet-empty-row" colSpan="7">
                      Nenhuma vaga encontrada com esses filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Vaga Individual */}
        <dialog
          ref={dialogSingleRef}
          className="vallet-dialog"
          onCancel={(e) => {
            e.preventDefault();
            setShowModalSingle(false);
          }}
        >
          <form onSubmit={handleCriarVaga}>
            <header className="vallet-dialog-header">
              <h2>Cadastrar Nova Vaga</h2>
              <button
                type="button"
                className="vallet-icon-btn"
                onClick={() => setShowModalSingle(false)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </header>

            <div className="vallet-dialog-grid">
              <label className="vallet-field">
                <span className="vallet-label">Identificador da Vaga</span>
                <input
                  type="text"
                  required
                  placeholder="Ex: A-01"
                  value={novaVaga.numero}
                  onChange={(e) =>
                    setNovaVaga({ ...novaVaga, numero: e.target.value })
                  }
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Localização / Setor</span>
                <input
                  type="text"
                  placeholder="Ex: Piso 1"
                  value={novaVaga.localizacao}
                  onChange={(e) =>
                    setNovaVaga({ ...novaVaga, localizacao: e.target.value })
                  }
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Tipo da Vaga</span>
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
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Preço Adicional/Diferenciado (R$)</span>
                <div className="vallet-currency-input">
                  <span className="vallet-currency-prefix">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novaVaga.preco}
                    onChange={(e) =>
                      setNovaVaga({ ...novaVaga, preco: e.target.value })
                    }
                  />
                </div>
              </label>
            </div>

            <footer className="vallet-dialog-footer">
              <button
                type="button"
                className="vallet-btn-clear"
                onClick={() => setShowModalSingle(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="vallet-btn-primary"
              >
                {submitting ? "Salvando..." : "Salvar Vaga"}
              </button>
            </footer>
          </form>
        </dialog>

        {/* Modal: Lote de Vagas */}
        <dialog
          ref={dialogLoteRef}
          className="vallet-dialog"
          onCancel={(e) => {
            e.preventDefault();
            setShowModalLote(false);
          }}
        >
          <form onSubmit={handleCriarLote}>
            <header className="vallet-dialog-header">
              <h2>Gerar Vagas em Lote</h2>
              <button
                type="button"
                className="vallet-icon-btn"
                onClick={() => setShowModalLote(false)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </header>

            <div className="vallet-dialog-grid">
              <label className="vallet-field">
                <span className="vallet-label">Quantidade de vagas</span>
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
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Prefixo</span>
                <input
                  type="text"
                  placeholder="Ex: A-"
                  value={loteVagas.prefixo}
                  onChange={(e) =>
                    setLoteVagas({ ...loteVagas, prefixo: e.target.value })
                  }
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Tipo de Vaga</span>
                <select
                  value={loteVagas.tipo}
                  onChange={(e) =>
                    setLoteVagas({ ...loteVagas, tipo: e.target.value })
                  }
                >
                  <option value="Comum">Comum</option>
                  <option value="IdosoPcd">Idoso / PCD</option>
                  <option value="Moto">Moto</option>
                </select>
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Localização / Setor Padrão</span>
                <input
                  type="text"
                  placeholder="Ex: Terreno Principal"
                  value={loteVagas.localizacao}
                  onChange={(e) =>
                    setLoteVagas({ ...loteVagas, localizacao: e.target.value })
                  }
                />
              </label>
              
              <label className="vallet-field">
                <span className="vallet-label">Preço por hora (R$)</span>
                <div className="vallet-currency-input">
                  <span className="vallet-currency-prefix">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={loteVagas.preco}
                    onChange={(e) =>
                      setLoteVagas({ ...loteVagas, preco: e.target.value })
                    }
                  />
                </div>
              </label>
            </div>

            <footer className="vallet-dialog-footer">
              <button
                type="button"
                className="vallet-btn-clear"
                onClick={() => setShowModalLote(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="vallet-btn-primary"
              >
                {submitting ? "Gerando..." : "Gerar Vagas"}
              </button>
            </footer>
          </form>
        </dialog>

      </div>
    </Layout>
  );
}