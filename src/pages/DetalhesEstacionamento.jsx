import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";

function IconeVaga({ tipo }) {
  const caminhos = {
    editar: <path d="m16 3 5 5M4 16 16 4a2.1 2.1 0 0 1 3 3L7 19l-4 1z" />,
    excluir: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />,
    adicionar: <path d="M12 5v14M5 12h14" />,
    lote: <path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" />,
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
    numero: "", localizacao: "", preco: 0, tipo: "Comum", preferencial: false,
  });

  const [loteVagas, setLoteVagas] = useState({
    quantidade: 10, prefixo: "A-", tipo: "Comum", preco: 0, localizacao: "", preferencial: false,
  });

  useEffect(() => {
    carregarDados();
  }, [estacionamentoId]);

  useEffect(() => {
    if (showModalSingle && dialogSingleRef.current && !dialogSingleRef.current.open) {
      dialogSingleRef.current.showModal();
    } else if (!showModalSingle && dialogSingleRef.current?.open) {
      dialogSingleRef.current.close();
    }
  }, [showModalSingle]);

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
      const matchesSearch = !normalizedSearch || (vaga.numero && vaga.numero.toLowerCase().includes(normalizedSearch)) || (vaga.localizacao && vaga.localizacao.toLowerCase().includes(normalizedSearch));
      const matchesCategory = category === "todas" || vaga.tipo === category;
      const isDisponivel = vaga.disponivel ? "Livre" : "Ocupada";
      const matchesAvailability = availability === "todas" || isDisponivel === availability;
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [availability, category, search, vagas]);

  async function handleCriarVaga(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiService.criarVaga({
        ...novaVaga, preco: parseFloat(novaVaga.preco) || 0, estacionamentoId,
      });
      setShowModalSingle(false);
      setNovaVaga({ numero: "", localizacao: "", preco: 0, tipo: "Comum", preferencial: false });
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
        ...loteVagas, quantidade: Number(loteVagas.quantidade), preco: parseFloat(loteVagas.preco) || 0, estacionamentoId,
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
      setVagas((prev) => prev.map((v) => v.id === vaga.id ? { ...v, disponivel: !v.disponivel } : v));
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

  const enderecoObj = typeof estacionamento?.endereco === "object" ? estacionamento.endereco : {};

  return (
    <Layout title="Dados do estacionamento">
      <div className="vallet-form-container">
        
        <header className="vallet-details-header">
          <div>
            <div className="vallet-details-title-group">
                {estacionamento.fotoEstacionamentoUri ? (
                    <img src={estacionamento.fotoEstacionamentoUri} alt={estacionamento.nome} className="vallet-details-thumb" />
                  ) : (
                    <span>Sem foto</span>
                  )}
              <h2 className="vallet-details-title">{estacionamento?.nome || "Estacionamento"}</h2>
              <span className="vallet-badge vallet-badge-active">Ativo</span>
            </div>
            <p className="vallet-details-code">Código do sistema: {estacionamentoId}</p>
          </div>

          <div className="vallet-details-actions">
            <button className="vallet-btn-clear" type="button" onClick={() => excluir_estacionamento(estacionamentoId)}>
              Excluir estacionamento
            </button>
            {estacionamento && (
              <Link className="vallet-btn-secondary" to={`/estacionamentos/${estacionamentoId}/editar`}>
                <IconeVaga tipo="editar" />
                Editar
              </Link>
            )}
            <Link className="vallet-cancel-link vallet-link-back" to="/estacionamentos">
              Voltar
            </Link>
          </div>
        </header>

        {error && <div role="alert" className="vallet-error-banner">{error}</div>}

        <div className="vallet-section">
          <h3 className="vallet-section-title">Informações principais</h3>
          <hr className="vallet-divider" />
          <div className="vallet-grid-row-1">
            <div className="vallet-field">
              <span className="vallet-label">Nome</span>
              <div className="vallet-info-text">{estacionamento?.nome || "-"}</div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">CNPJ</span>
              <div className="vallet-info-text">{estacionamento?.cnpj || "-"}</div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">Telefone</span>
              <div className="vallet-info-text">{estacionamento?.telefone || "-"}</div>
            </div>
          </div>
        </div>

        <div className="vallet-section">
          <h3 className="vallet-section-title">Endereço</h3>
          <hr className="vallet-divider" />
          <div className="vallet-grid-row-3">
            <div className="vallet-field">
              <span className="vallet-label">Logradouro</span>
              <div className="vallet-info-text">
                {[enderecoObj.logradouro || (typeof estacionamento?.endereco === "string" ? estacionamento.endereco : ""), enderecoObj.numero].filter(Boolean).join(", ") || "-"}
              </div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">CEP</span>
              <div className="vallet-info-text">{enderecoObj.cep || "-"}</div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">Bairro</span>
              <div className="vallet-info-text">{enderecoObj.bairro || "-"}</div>
            </div>
            <div className="vallet-field">
              <span className="vallet-label">Cidade / UF</span>
              <div className="vallet-info-text">
                {enderecoObj.cidade || enderecoObj.localidade || estacionamento?.cidade || "-"} - {enderecoObj.uf || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="vallet-section">
          <h3 className="vallet-section-title">Gestão de vagas</h3>
          <hr className="vallet-divider" />

          <div className="vallet-grid-cards">
            <div className="vallet-card-resumo">
              <div className="vallet-label vallet-card-label">Total de vagas</div>
              <div className="vallet-card-value">{vagas.length}</div>
            </div>
            <div className="vallet-card-resumo">
              <div className="vallet-label vallet-card-label">Disponíveis</div>
              <div className="vallet-card-value">{vagas.filter((v) => v.disponivel).length}</div>
            </div>
            <div className="vallet-card-resumo">
              <div className="vallet-label vallet-card-label">PCD / Preferenciais</div>
              <div className="vallet-card-value">{vagas.filter((v) => v.tipo === "IdosoPcd" || v.preferencial).length}</div>
            </div>
            <div className="vallet-card-resumo">
              <div className="vallet-label vallet-card-label">Ocupadas</div>
              <div className="vallet-card-value">{vagas.filter((v) => !v.disponivel).length}</div>
            </div>
          </div>

          <div className="vallet-vacancies-header">
            <h4 className="vallet-vacancies-title">Lista de vagas</h4>
            <div className="vallet-actions-group">
              <button className="vallet-btn-secondary" type="button" onClick={() => setShowModalLote(true)}>
                <IconeVaga tipo="lote" /> Gerar em lote
              </button>
              <button className="vallet-btn-secondary" type="button" onClick={() => setShowModalSingle(true)}>
                <IconeVaga tipo="adicionar" /> Nova vaga
              </button>
            </div>
          </div>

          <div className="vallet-grid-row-3 vallet-filter-bar">
            <label className="vallet-field vallet-field--wide">
              <span className="vallet-label">Pesquisar vaga</span>
              <input type="search" placeholder="Número ou localização" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <label className="vallet-field">
              <span className="vallet-label">Categoria</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="todas">Todas</option>
                <option value="Comum">Comum</option>
                <option value="IdosoPcd">Idoso / PCD</option>
                <option value="Moto">Moto</option>
              </select>
            </label>
            <label className="vallet-field">
              <span className="vallet-label">Disponibilidade</span>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
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
                  <th>Vaga</th><th>Localização</th><th>Categoria</th><th>Preço/h</th><th>Preferencial</th><th>Disponibilidade</th><th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {filteredVacancies.length ? (
                  filteredVacancies.map((vacancy) => (
                    <tr key={vacancy.id}>
                      <td><strong>{vacancy.numero}</strong></td>
                      <td>{vacancy.localizacao || "Padrão"}</td>
                      <td>{vacancy.tipo === "IdosoPcd" ? "Idoso / PCD" : vacancy.tipo}</td>
                      <td>R$ {parseFloat(vacancy.preco || 0).toFixed(2)}</td>
                      <td>{vacancy.preferencial ? "Sim" : "Não"}</td>
                      <td>
                        <button type="button" className="vallet-status-btn" onClick={() => toggleDisponibilidade(vacancy)} title="Clique para alterar status">
                          <span className={`vallet-badge ${vacancy.disponivel ? 'vallet-badge-livre' : 'vallet-badge-ocupada'}`}>
                            {vacancy.disponivel ? "Livre" : "Ocupada"}
                          </span>
                        </button>
                      </td>
                      <td>
                        <div className="vallet-row-actions">
                          <button type="button" className="vallet-icon-btn" title="Excluir vaga" onClick={async () => {
                            if (window.confirm(`Deseja excluir a vaga ${vacancy.numero}?`)) {
                              await apiService.excluirVaga(vacancy.id);
                              carregarDados();
                            }
                          }}>
                            <IconeVaga tipo="excluir" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="vallet-empty-row" colSpan="7">Nenhuma vaga encontrada com esses filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </Layout>
  );
}
