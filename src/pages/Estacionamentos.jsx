import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";
import { applyMask, formatCep, formatCnpj, formatPhone } from "../utils/inputMasks";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

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

export default function Estacionamentos() {
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");
  
  // Estados para Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    carregarEstacionamentos();
  }, []);

  // Voltar para a primeira página sempre que o termo de busca mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

  async function carregarEstacionamentos() {
    try {
      setLoading(true);
      const data = await apiService.getEstacionamentos();
      setEstacionamentos(data || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar estacionamentos.");
    } finally {
      setLoading(false);
    }
  }

  const estacionamentosFiltrados = estacionamentos.filter((est) =>
    est.nome?.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // Cálculos de Paginação
  const totalPaginas = Math.max(1, Math.ceil(estacionamentosFiltrados.length / itensPorPagina));
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const estacionamentosPaginados = estacionamentosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  const paginas = [
    ...new Set([1, paginaAtual - 1, paginaAtual, paginaAtual + 1, totalPaginas]),
  ].filter((p) => p >= 1 && p <= totalPaginas).sort((a, b) => a - b);

  return (
    <Layout title="Estacionamentos">
      <section className="list-card">
        
        <header className="list-header" style={{ flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2>Estacionamentos cadastrados</h2>
            <p>Visualize e gerencie todas as unidades do sistema.</p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            
            {!loading && (estacionamentos.length > 0 || termoBusca) && (
              <div style={{ position: "relative", width: "260px" }}>
                <input
                  type="text"
                  placeholder="Pesquisar por nome..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 36px 0 16px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: "Poppins, sans-serif",
                    color: "var(--text-main)",
                    outline: "none",
                    background: "var(--surface)",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--support-mid)";
                    e.target.style.boxShadow = "0 0 0 2px rgba(151, 166, 151, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-light)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {termoBusca ? (
                  <button
                    type="button"
                    onClick={() => setTermoBusca("")}
                    style={{
                      position: "absolute",
                      right: "6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--secondary-color)",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-main)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    title="Limpar pesquisa"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                ) : (
                  <div style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--support-mid)",
                      pointerEvents: "none",
                      display: "flex"
                  }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                )}
              </div>
            )}

            <Link className="primary-link" to="/estacionamentos/novo">
              + Novo estacionamento
            </Link>
          </div>
        </header>

        {error && (
          <div
            className="error-message"
            style={{ color: "red", padding: "10px" }}
          >
            {error}
          </div>
        )}

        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th>Estacionamento</th>
                <th>CNPJ</th>
                <th>Vagas</th>
                <th>Funcionamento</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Carregando estacionamentos...
                  </td>
                </tr>
              ) : estacionamentos.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan="6">
                    <div className="table-empty-state">
                      <span>▣</span>
                      <strong>Nenhum estacionamento cadastrado</strong>
                      <p>Os estacionamentos aparecerão aqui após o cadastro.</p>
                      <Link
                        className="empty-preview-link"
                        to="/estacionamentos/novo"
                      >
                        Cadastrar o primeiro estacionamento
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : estacionamentosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "var(--secondary-color)",
                    }}
                  >
                    Nenhum estacionamento encontrado com "{termoBusca}".
                  </td>
                </tr>
              ) : (
              estacionamentosPaginados.map((est) => (
                <tr key={est.id || est.cnpj}>
                  <td>
                    <strong>{est.nome}</strong>
                    <br />
                    <small>
                      {[
                        est.endereco?.logradouro || est.logradouro,
                        est.endereco?.numero || est.numero,
                        est.endereco?.cidade || est.endereco?.localidade || est.cidade,
                        est.endereco?.uf || est.uf,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Endereço não informado"}
                    </small>
                  </td>
                  <td>{est.cnpj}</td>
                  <td>
                    {est.quantidadeVagasTotal ??
                      est.totalVagas ??
                      est.vagas_total ??
                      0}
                  </td>
                  <td>
                    {est.funciona24h === true
                      ? "24 horas"
                      : `${est.horarioAbertura}h às ${est.horarioFechamento}h`}
                  </td>
                  <td>
                    <Link
                      to={`/estacionamentos/${est.id}`}
                      className="table-action-btn"
                    >
                      <span>Ver detalhes</span>
                    </Link>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bloco de Paginação Visual */}
        {estacionamentosFiltrados.length > 0 && (
          <div className="vallet-pagination-bar" style={{ padding: "16px 24px" }}>
            <span aria-live="polite">
              {indiceInicial + 1}–{Math.min(indiceInicial + itensPorPagina, estacionamentosFiltrados.length)} de {estacionamentosFiltrados.length} estacionamentos
            </span>
            <nav className="vallet-pagination-nav" aria-label="Navegação de páginas">
              <button
                className="vallet-page-btn"
                type="button"
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(paginaAtual - 1)}
              >
                ‹
              </button>
              {paginas.map((pagina, indice) => (
                <span key={pagina} style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                  {indice > 0 && pagina - paginas[indice - 1] > 1 && <span>…</span>}
                  <button
                    className="vallet-page-btn"
                    type="button"
                    aria-current={paginaAtual === pagina ? "page" : undefined}
                    onClick={() => setPaginaAtual(pagina)}
                  >
                    {pagina}
                  </button>
                </span>
              ))}
              <button
                className="vallet-page-btn"
                type="button"
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual(paginaAtual + 1)}
              >
                ›
              </button>
            </nav>
          </div>
        )}

      </section>
    </Layout>
  );
}

export function CadastroEstacionamento() {
  const navigate = useNavigate();
  const { estacionamentoId } = useParams();
  const editando = Boolean(estacionamentoId);
  const [dadosIniciais, setDadosIniciais] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(editando);
  const [listaVagas, setListaVagas] = useState([]);
  const [modoVagas, setModoVagas] = useState("individual");
  const [erroVagas, setErroVagas] = useState("");
  const [modalVagas, setModalVagas] = useState(null);
  const [indiceEdicao, setIndiceEdicao] = useState(null);
  const [paginaVagas, setPaginaVagas] = useState(1);
  const dialogRef = useRef(null);
  const acionadorModal = useRef(null);
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [cidade, setCidade] = useState("");
  const formularioRef = useRef(null);
  const vagasPorPagina = 5;
  const totalPaginas = Math.max(
    1,
    Math.ceil(listaVagas.length / vagasPorPagina),
  );
  const paginaAtual = Math.min(paginaVagas, totalPaginas);
  const inicioPagina = (paginaAtual - 1) * vagasPorPagina;
  const vagasVisiveis = listaVagas.slice(
    inicioPagina,
    inicioPagina + vagasPorPagina,
  );
  const paginas = [
    ...new Set([
      1,
      paginaAtual - 1,
      paginaAtual,
      paginaAtual + 1,
      totalPaginas,
    ]),
  ]
    .filter((pagina) => pagina >= 1 && pagina <= totalPaginas)
    .sort((a, b) => a - b);
  const vagaVazia = {
    numero: "",
    prefixo: "A-",
    quantidade: 10,
    tipo: "Comum",
    preco: "0",
    localizacao: "",
  };
  const [rascunhoVaga, setRascunhoVaga] = useState(vagaVazia);
  const [submitting, setSubmitting] = useState(false);
  const [funciona24h, setFunciona24h] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminSelecionado, setAdminSelecionado] = useState("");
  const [erroAdmins, setErroAdmins] = useState("");
  const [restauracaoFormulario, setRestauracaoFormulario] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [fotoAtual, setFotoAtual] = useState(null);
  const [novaFoto, setNovaFoto] = useState(null);
  const [previewNovaFoto, setPreviewNovaFoto] = useState(null);

  useEffect(() => {
    let ativo = true;
    setErrorMessage("");
    setDadosIniciais(null);
    setAdmins([]);
    setErroAdmins("");
    async function carregarAdminsDisponiveis() {
      try {
        const lista = await apiService.getAdminsDisponiveis();
        if (!Array.isArray(lista)) throw new Error("Lista de administradores inválida.");
        return lista;
      } catch (err) {
        if (ativo) setErroAdmins(err.message || "Não foi possível carregar os administradores disponíveis.");
        return [];
      }
    }
    if (!estacionamentoId) {
      restaurarOpcoes(null, []);
      setCarregandoDados(false);
      carregarAdminsDisponiveis().then(res => { if (ativo) setAdmins(res); });
      return () => {
        ativo = false;
      };
    }
    setCarregandoDados(true);

    Promise.all([
      apiService.getEstacionamentoPorId(estacionamentoId),
      carregarAdminsDisponiveis(),
      apiService.getVagasEstacionamento(estacionamentoId).catch(() => [])
    ])
      .then(async ([est, adminsData, vagasData]) => {
        let listaAdmins = adminsData || [];
        if (est.adminUid) {
          try {
            // Identidade vem do UID vinculado, não do e-mail em cache no estacionamento.
            const administrador = await apiService.getGerentePorId(est.adminUid);
            if (!administrador || typeof administrador !== "object" || Array.isArray(administrador)
                || (!administrador.nome && !administrador.email)
                || (administrador.uid && administrador.uid !== est.adminUid)) {
              throw new Error("A consulta não retornou o administrador vinculado.");
            }
            listaAdmins = [
              ...listaAdmins.filter((adm) => (adm.uid || adm.id) !== est.adminUid),
              { ...administrador, uid: est.adminUid },
            ];
          } catch (err) {
            // Não substituir o responsável por outro disponível se a consulta falhar.
            listaAdmins = listaAdmins.filter((adm) => (adm.uid || adm.id) !== est.adminUid);
            if (ativo) setErroAdmins((anterior) => [anterior,
              "Não foi possível confirmar o nome do administrador vinculado. " + (err.message || "Falha na consulta.")
            ].filter(Boolean).join(" "));
          }
        }
        if (!ativo) return;
        setDadosIniciais(est);
        setAdmins(listaAdmins);
        restaurarOpcoes(est, vagasData || []);
        
        if (est.fotoEstacionamentoUri) {
          setFotoAtual(est.fotoEstacionamentoUri);
        }

        if (est.endereco && typeof est.endereco === "object") {
          setCep(est.endereco.cep || "");
          setLogradouro(est.endereco.logradouro || "");
          setBairro(est.endereco.bairro || "");
          setCidade(est.endereco.cidade || est.endereco.localidade || "");
        } else if (typeof est.endereco === "string") {
          setLogradouro(est.endereco);
          setCep(est.cep || "");
          setBairro(est.bairro || "");
          setCidade(est.cidade || "");
        }
      })
      .catch((err) => {
        if (ativo)
          setErrorMessage(err.message || "Erro ao carregar estacionamento.");
      })
      .finally(() => {
        if (ativo) setCarregandoDados(false);
      });
    return () => {
      ativo = false;
    };
  }, [estacionamentoId]);

  useEffect(() => {
    if (modalVagas && dialogRef.current && !dialogRef.current.open)
      dialogRef.current.showModal();
  }, [modalVagas]);

  function fecharModal() {
    dialogRef.current?.close();
    setModalVagas(null);
    setErroVagas("");
    requestAnimationFrame(() => {
      const botao = acionadorModal.current;
      if (botao?.isConnected) botao.focus();
      else
        formularioRef.current?.querySelector("[data-adicionar-vaga]")?.focus();
    });
  }

  function abrirModal(modo, indice = null) {
    acionadorModal.current = document.activeElement;
    setIndiceEdicao(indice);
    setModoVagas(modo === "lote" ? "lote" : "individual");
    const precoBase =
      formularioRef.current?.elements.namedItem("valorHora")?.value || "0";
    setRascunhoVaga(
      indice === null
        ? { ...vagaVazia, preco: precoBase }
        : {
            ...vagaVazia,
            ...listaVagas[indice],
            preco: String(listaVagas[indice].preco),
          },
    );
    setErroVagas("");
    setModalVagas(modo);
  }

  async function excluirVaga(indice) {
    const vaga = listaVagas[indice];
    if (!window.confirm(`Excluir a vaga ${vaga.numero}?`)) return;

    if (editando) {
      try {
        await apiService.excluirVaga(vaga.id);
        const restantes = listaVagas.filter((_, i) => i !== indice);
        setListaVagas(restantes);
        setPaginaVagas(Math.min(paginaAtual, Math.max(1, Math.ceil(restantes.length / vagasPorPagina))));
      } catch (err) {
        alert("Erro ao excluir vaga no servidor.");
      }
    } else {
      const restantes = listaVagas.filter((_, i) => i !== indice);
      setListaVagas(restantes);
      setPaginaVagas(Math.min(paginaAtual, Math.max(1, Math.ceil(restantes.length / vagasPorPagina))));
    }
  }

  function restaurarOpcoes(est, vagas = []) {
    setAdminSelecionado(est?.adminUid || "");
    setFunciona24h(est?.funciona24h === true);
    setListaVagas(vagas);
    setRascunhoVaga(vagaVazia);
    setErroVagas("");
    setPaginaVagas(1);
    setModalVagas(null);
    setNovaFoto(null);
    setPreviewNovaFoto(null);
  }

  async function adicionarVagas(event) {
    event.preventDefault();
    setErroVagas("");
    const quantidade =
      modoVagas === "lote" ? Number(rascunhoVaga.quantidade) : 1;
    const preco = Number(rascunhoVaga.preco);
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 100) {
      setErroVagas("Informe de 1 a 100 vagas por lote.");
      return;
    }
    if (listaVagas.length + (indiceEdicao === null ? quantidade : 0) > 499) {
      setErroVagas(
        "Você pode cadastrar até 499 vagas junto com o estacionamento. Adicione as demais nos detalhes.",
      );
      return;
    }
    if (
      !rascunhoVaga.preco.toString().trim() ||
      !Number.isFinite(preco) ||
      preco < 0
    ) {
      setErroVagas("Informe um preço válido, maior ou igual a zero.");
      return;
    }
    const novas = Array.from({ length: quantidade }, (_, indice) => ({
      numero:
        modoVagas === "lote"
          ? `${rascunhoVaga.prefixo.trim()}${indice + 1}`
          : rascunhoVaga.numero.trim(),
      localizacao: rascunhoVaga.localizacao.trim(),
      tipo: rascunhoVaga.tipo,
      preco,
      preferencial: rascunhoVaga.tipo === "IdosoPcd",
    }));
    
    const numeros = new Set(
      listaVagas
        .filter((_, indice) => indice !== indiceEdicao)
        .map((vaga) => vaga.numero.toLowerCase()),
    );
    for (const vaga of novas) {
      if (
        !vaga.numero ||
        vaga.numero.length > 100 ||
        numeros.has(vaga.numero.toLowerCase())
      ) {
        setErroVagas(
          "Informe identificadores únicos, com até 100 caracteres. Para outro lote, use outro prefixo.",
        );
        return;
      }
      numeros.add(vaga.numero.toLowerCase());
    }

    if (editando) {
      setSubmitting(true);
      try {
        if (modoVagas === "lote") {
          await apiService.criarVagasEmLote({
            quantidade,
            prefixo: rascunhoVaga.prefixo.trim(),
            tipo: rascunhoVaga.tipo,
            preco,
            localizacao: rascunhoVaga.localizacao.trim(),
            preferencial: rascunhoVaga.tipo === "IdosoPcd",
            estacionamentoId
          });
        } else if (indiceEdicao !== null) {
          const vagaId = listaVagas[indiceEdicao].id;
          await apiService.atualizarVaga(vagaId, {
            numero: rascunhoVaga.numero.trim(),
            localizacao: rascunhoVaga.localizacao.trim(),
            tipo: rascunhoVaga.tipo,
            preco,
            preferencial: rascunhoVaga.tipo === "IdosoPcd"
          });
        } else {
          await apiService.criarVaga({
            numero: rascunhoVaga.numero.trim(),
            localizacao: rascunhoVaga.localizacao.trim(),
            tipo: rascunhoVaga.tipo,
            preco,
            preferencial: rascunhoVaga.tipo === "IdosoPcd",
            estacionamentoId
          });
        }
        const vagasAtualizadas = await apiService.getVagasEstacionamento(estacionamentoId);
        setListaVagas(vagasAtualizadas || []);
        fecharModal();
      } catch (err) {
        setErroVagas(err.message || "Erro ao salvar vaga no servidor.");
      } finally {
        setSubmitting(false);
      }
    } else {
      if (indiceEdicao !== null) {
        setListaVagas((atuais) =>
          atuais.map((vaga, indice) =>
            indice === indiceEdicao ? novas[0] : vaga,
          ),
        );
      } else {
        setListaVagas((atuais) => [...atuais, ...novas]);
        setPaginaVagas(Math.floor(listaVagas.length / vagasPorPagina) + 1);
      }
      fecharModal();
    }
  }
    
  useEffect(() => {
    const rascunho = sessionStorage.getItem("rascunhoEstacionamento");
    if (rascunho && !editando) {
      const data = JSON.parse(rascunho);
      Object.entries(data).forEach(([name, value]) => {
        if (name === "adminUid") return;
        const input = document.querySelector(`[name="${name}"]`);
        if (input) {
          if (input.type === "checkbox" || input.type === "radio") {
            input.checked = value === "on" || value === true;
          } else {
            input.value = value;
          }
        }
      });
      setAdminSelecionado(String(data.adminUid || ""));
      if (data.cep) setCep(data.cep);
      if (data.logradouro) setLogradouro(data.logradouro);
      if (data.bairro) setBairro(data.bairro);
      if (data.cidade) setCidade(data.cidade);
    }
  }, [editando]);

  function valorInicial(campo) {
    const est = dadosIniciais || {};
    const endereco = typeof est.endereco === "object" && est.endereco ? est.endereco : {};
    if (campo === "cidade") return endereco.cidade || endereco.localidade || est.cidade || "";
    if (campo === "logradouro" && typeof est.endereco === "string") return est.endereco;
    if (["cep", "logradouro", "complemento", "numero", "bairro", "uf"].includes(campo)) {
      return endereco[campo] || est[campo] || "";
    }
    if (campo === "horarioAbertura" || campo === "horarioFechamento") {
      return (est[campo] || "").replace(/^(\d):/, "0$1:");
    }
    return est[campo] ?? "";
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNovaFoto(file);
      setPreviewNovaFoto(URL.createObjectURL(file));
    } else {
      descartarNovaFoto();
    }
  };

  const descartarNovaFoto = () => {
    setNovaFoto(null);
    setPreviewNovaFoto(null);
    const input = document.getElementById("input-foto");
    if (input) input.value = "";
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    if (modalVagas) return;
    setErrorMessage("");
    if (!adminSelecionado || (!admins.some((adm) => (adm.uid || adm.id) === adminSelecionado)
        && adminSelecionado !== dadosIniciais?.adminUid)) {
      setErrorMessage("Selecione um administrador disponível ou mantenha o administrador atual.");
      return;
    }
    setSubmitting(true);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    let fotoFinalUri = fotoAtual;

    try {
      if (novaFoto) {
        const imgData = new FormData();
        imgData.append("file", novaFoto);
        const uploadRes = await apiService.uploadImagem(imgData);
        fotoFinalUri = uploadRes.url || uploadRes.fotoEstacionamentoUri;
      }

      const payload = {
        nome: (data.nome || "").trim(),
        cnpj: (data.cnpj || "").trim(),
        telefone: (data.telefone || "").trim(),
        adminUid: adminSelecionado,

        endereco: {
          cep: (data.cep || "").trim(),
          logradouro: (data.logradouro || "").trim(),
          complemento: (data.complemento || "").trim(),
          numero: (data.numero || "").trim(),
          bairro: (data.bairro || "").trim(),
          cidade: (data.cidade || "").trim(),
          uf: (data.uf || "").trim().toUpperCase(),
        },

        valorHora: parseFloat(data.valorHora) || 0,
        funciona24h,
        horarioAbertura: funciona24h ? "00:00" : data.horarioAbertura,
        horarioFechamento: funciona24h ? "00:00" : data.horarioFechamento,
        fotoEstacionamentoUri: fotoFinalUri,
      };

      if (!payload.endereco.cidade || !payload.nome) {
        setErrorMessage("Nome e cidade são obrigatórios.");
        setSubmitting(false);
        return;
      }

      if (!editando) payload.vagasIniciais = listaVagas;

      if (editando) {
        await apiService.atualizarEstacionamento(estacionamentoId, payload);
      } else {
        await apiService.criarEstacionamento(payload);
      }
      
      sessionStorage.removeItem("rascunhoEstacionamento");
      alert(editando ? "Estacionamento atualizado com sucesso!" : "Estacionamento cadastrado com sucesso!");
      navigate(editando ? `/estacionamentos/${estacionamentoId}` : "/estacionamentos");
    } catch (err) {
      setErrorMessage(err.message || "Erro ao salvar os dados.");
    } finally {
      setSubmitting(false);
    }
  }

  if (carregandoDados || (editando && !dadosIniciais)) {
    return (
      <Layout title="Editar estacionamento">
        <p role={errorMessage ? "alert" : "status"} className="vallet-error-banner">
          {errorMessage || "Carregando estacionamento..."}
        </p>
        <Link className="vallet-link-back" to="/estacionamentos">Voltar para estacionamentos</Link>
      </Layout>
    );
  }

  async function findCEP(cepBusca) {
    const digits = cepBusca.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json`);
      const data = await res.json();
      if (!data.erro) {
        setCidade(data.localidade || "");
        setBairro(data.bairro || "");
        setLogradouro(data.logradouro || "");
      }
    } catch (err) {
      console.warn("CEP não encontrado", err);
    }
  }

  return (
    <Layout title={editando ? "Editar Estacionamento" : "Cadastrar Estacionamento"}>
      <div className="vallet-form-container">
        {errorMessage && <div role="alert" className="vallet-error-banner">{errorMessage}</div>}

        <h2 className="vallet-section-title">
          {editando ? "Editar Estacionamento" : "Informações do Estacionamento"}
        </h2>
        <p className="muted vallet-subtitle">
          {editando ? "Atualize os dados, imagens e a estrutura de vagas do local." : "Preencha os dados e anexe uma foto."}
        </p>

        <form
          ref={formularioRef}
          onSubmit={handleSubmit}
          key={`${estacionamentoId || "novo"}:${restauracaoFormulario}`}
          onReset={(event) => {
            event.preventDefault();
            setRestauracaoFormulario((valor) => valor + 1);
            restaurarOpcoes(dadosIniciais, editando ? listaVagas : []);
            sessionStorage.removeItem("rascunhoEstacionamento");
          }}
          onChange={(e) => {
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            sessionStorage.setItem("rascunhoEstacionamento", JSON.stringify(data));
          }}
        >

        <div className="vallet-section">
          <div className="vallet-layout-split">
            
            <div className="vallet-layout-left">
              
              <div className="vallet-form-line">
                <label className="vallet-field" style={{ gridColumn: "span 5" }}>
                  <span className="vallet-label">Nome</span>
                  <input name="nome" type="text" placeholder="Vallet Centro" required defaultValue={valorInicial("nome")} />
                </label>
                <label className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">CNPJ</span>
                  <input name="cnpj" type="text" placeholder="12.345.678/0001-90" maxLength="18" onChange={applyMask(formatCnpj)} required defaultValue={valorInicial("cnpj")} />
                </label>
                <label className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">Telefone</span>
                  <input name="telefone" type="tel" placeholder="(13) 99999-1234" maxLength="15" onChange={applyMask(formatPhone)} required defaultValue={valorInicial("telefone")} />
                </label>
              </div>

              <div className="vallet-form-line">
                <div className="vallet-field" style={{ gridColumn: "span 6" }}>
                  <span className="vallet-label">Administrador responsável</span>
                  <div className="vallet-admin-wrapper">
                    <Link className="vallet-add-admin-btn" to="/estacionamentos/novo/gerente">+</Link>
                    <select name="adminUid" aria-label="Administrador responsável" required value={adminSelecionado} onChange={(event) => setAdminSelecionado(event.target.value)} disabled={submitting}>
                      {dadosIniciais?.adminUid && !admins.some((adm) => (adm.uid || adm.id) === dadosIniciais.adminUid) && (
                        <option value={dadosIniciais.adminUid}>
                          {"Administrador atual (cadastro indisponível)"}
                        </option>
                      )}
                      <option value="" disabled>Selecione...</option>
                      {admins.map((adm) => (
                        <option key={adm.uid || adm.id} value={adm.uid || adm.id}>{adm.nome && adm.email ? `${adm.nome} (${adm.email})` : adm.nome || adm.email}</option>
                      ))}
                    </select>
                  </div>
                  {erroAdmins && <small role="alert" style={{ color: "var(--secondary-color, #637365)" }}>
                    {erroAdmins} {editando && dadosIniciais?.adminUid ? "O administrador atual foi mantido." : "Não foi possível carregar as opções para seleção."}
                  </small>}
                </div>
                <label className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">CEP</span>
                  <input
                    name="cep"
                    type="text"
                    placeholder="11010-000"
                    maxLength="9"
                    required
                    defaultValue={valorInicial("cep")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      e.target.value = formatCep(raw);
                      if (raw.length === 8) findCEP(raw);
                    }}
                  />
                </label>
                <label className="vallet-field" style={{ gridColumn: "span 1" }}>
                  <span className="vallet-label">UF</span>
                  <select name="uf" required defaultValue={valorInicial("uf") || "SP"}>
                    {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </label>
              </div>

             <div className="vallet-form-line">
                <label className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">Cidade</span>
                  <input 
                    name="cidade" 
                    type="text" 
                    placeholder="Santos" 
                    required 
                    value={cidade} 
                    onChange={(e) => setCidade(e.target.value)} 
                  />
                </label>
                <label className="vallet-field" style={{ gridColumn: "span 2" }}>
                  <span className="vallet-label">Bairro</span>
                  <input 
                    name="bairro" 
                    type="text" 
                    placeholder="Centro" 
                    required 
                    value={bairro} 
                    onChange={(e) => setBairro(e.target.value)} 
                  />
                </label>
                <label className="vallet-field" style={{ gridColumn: "span 4" }}>
                  <span className="vallet-label">Logradouro</span>
                  <input 
                    name="logradouro" 
                    type="text" 
                    placeholder="Rua João Pessoa" 
                    required 
                    value={logradouro} 
                    onChange={(e) => setLogradouro(e.target.value)} 
                  />
                </label>
                <label className="vallet-field" style={{ gridColumn: "span 1" }}>
                  <span className="vallet-label">Número</span>
                  <input 
                    name="numero" 
                    type="text" 
                    placeholder="120" 
                    required 
                    defaultValue={valorInicial("numero")} 
                  />
                </label>
              </div>
            </div>

            <div className="vallet-photo-area">
              <span className="vallet-label">{editando ? "Foto Atual" : "Foto do Estacionamento"}</span>
              {previewNovaFoto || fotoAtual ? (
                <div className="vallet-photo-box">
                  <img src={previewNovaFoto || fotoAtual} alt="Prévia" />
                </div>
              ) : (
                <div className="vallet-photo-dropzone">
                  <p className="muted" style={{ fontSize: "13px" }}>Nenhuma foto</p>
                </div>
              )}
              <div className="vallet-photo-actions">
                <input id="input-foto" type="file" accept="image/*" onChange={handleFotoChange} className="vallet-file-input" />
              </div>
            </div>

          </div>
        </div>

        <div className="vallet-section">
          <h2 className="vallet-section-title">Funcionamento e valores</h2>
          <hr className="vallet-divider" />
          
          <div className="vallet-form-line" style={{ alignItems: "end" }}>
            <label className="vallet-field" style={{ gridColumn: "span 2" }}>
              <span className="vallet-label">Valor por hora</span>
              <div className="vallet-currency-input">
                <span className="vallet-currency-prefix">R$</span>
                <input name="valorHora" type="number" min="0" step="0.01" placeholder="15.00" required defaultValue={valorInicial("valorHora")} />
              </div>
            </label>

            <label className="vallet-field" style={{ gridColumn: "span 2" }}>
              <span className="vallet-label">Abertura</span>
              <input name="horarioAbertura" type="time" disabled={funciona24h} required={!funciona24h} defaultValue={valorInicial("horarioAbertura")} />
            </label>

            <label className="vallet-field" style={{ gridColumn: "span 2" }}>
              <span className="vallet-label">Fechamento</span>
              <input name="horarioFechamento" type="time" disabled={funciona24h} required={!funciona24h} defaultValue={valorInicial("horarioFechamento")} />
            </label>

            <div className="vallet-field-switch" style={{ gridColumn: "span 3", display: "flex", alignItems: "center", height: "40px" }}>
              <button className="vallet-toggle" type="button" role="switch" aria-checked={funciona24h} onClick={() => setFunciona24h((ativo) => !ativo)}>
                <span className="vallet-toggle-track" aria-hidden="true"><span className="vallet-toggle-thumb" /></span>
                <span>Funciona 24h</span>
              </button>
            </div>
          </div>
        </div>

        <div className="vallet-section" aria-labelledby="titulo-vagas">
          <div className="vallet-vacancies-header">
            <h2 id="titulo-vagas" className="vallet-vacancies-title">
              Vagas do estacionamento
              <span className="vallet-badge" aria-live="polite">
                {listaVagas.length}
              </span>
            </h2>
            <div className="vallet-actions-group">
              <button
                type="button"
                data-adicionar-vaga
                className="vallet-btn-secondary"
                disabled={submitting}
                onClick={() => abrirModal("individual")}
              >
                <IconeVaga tipo="adicionar" />
                Adicionar vaga
              </button>
              <button
                type="button"
                className="vallet-btn-secondary"
                disabled={submitting}
                onClick={() => abrirModal("lote")}
              >
                <IconeVaga tipo="lote" />
                Gerar lote
              </button>
            </div>
          </div>

          <div className="vallet-table-wrapper">
            <table className="vallet-table">
              <thead>
                <tr>
                  <th>Identificador</th>
                  <th>Tipo</th>
                  <th>Setor</th>
                  <th>Valor por hora</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {vagasVisiveis.length ? (
                  vagasVisiveis.map((vaga, indice) => (
                    <tr key={vaga.numero}>
                      <td>{vaga.numero}</td>
                      <td>
                        {vaga.tipo === "IdosoPcd" ? "Idoso / PCD" : vaga.tipo}
                      </td>
                      <td>{vaga.localizacao || "—"}</td>
                      <td>
                        {vaga.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td>
                        <div className="vallet-row-actions">
                          <button
                            type="button"
                            className="vallet-icon-btn"
                            disabled={submitting}
                            aria-label={`Editar vaga ${vaga.numero}`}
                            title="Editar vaga"
                            onClick={() => abrirModal("editar", inicioPagina + indice)}
                          >
                            <IconeVaga tipo="editar" />
                          </button>
                          <button
                            type="button"
                            className="vallet-icon-btn"
                            disabled={submitting}
                            aria-label={`Excluir vaga ${vaga.numero}`}
                            title="Excluir vaga"
                            onClick={() => excluirVaga(inicioPagina + indice)}
                          >
                            <IconeVaga tipo="excluir" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="vallet-empty-row">
                      Nenhuma vaga cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {listaVagas.length > 0 && (
            <div className="vallet-pagination-bar">
              <span aria-live="polite">
                {inicioPagina + 1}–
                {Math.min(
                  inicioPagina + vagasPorPagina,
                  listaVagas.length,
                )}{" "}
                de {listaVagas.length} vagas
              </span>
              <nav className="vallet-pagination-nav" aria-label="Páginas de vagas">
                <button
                  className="vallet-page-btn"
                  type="button"
                  aria-label="Página anterior"
                  disabled={paginaAtual === 1}
                  onClick={() => setPaginaVagas(paginaAtual - 1)}
                >
                  ‹
                </button>
                {paginas.map((pagina, indice) => (
                  <span key={pagina} style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                    {indice > 0 && pagina - paginas[indice - 1] > 1 && (
                      <span>…</span>
                    )}
                    <button
                      className="vallet-page-btn"
                      type="button"
                      aria-label={`Página ${pagina}`}
                      aria-current={paginaAtual === pagina ? "page" : undefined}
                      onClick={() => setPaginaVagas(pagina)}
                    >
                      {pagina}
                    </button>
                  </span>
                ))}
                <button
                  className="vallet-page-btn"
                  type="button"
                  aria-label="Próxima página"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPaginaVagas(paginaAtual + 1)}
                >
                  ›
                </button>
              </nav>
            </div>
          )}
        </div>

          <footer className="vallet-form-footer">
            <Link className="vallet-cancel-link" to={editando ? `/estacionamentos/${estacionamentoId}` : "/estacionamentos"}>
              Cancelar
            </Link>
            <button
              className="vallet-btn-clear"
              type="reset"
              disabled={submitting}
            >
              {editando ? "Restaurar dados" : "Limpar"}
            </button>
            <button
              className="vallet-btn-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Cadastrar estacionamento"}
            </button>
          </footer>
        </form>

        {modalVagas && (
          <dialog
            ref={dialogRef}
            className="vallet-dialog"
            aria-labelledby="titulo-editor-vaga"
            onCancel={(event) => {
              event.preventDefault();
              fecharModal();
            }}
          >
            <form onSubmit={adicionarVagas}>
              <header className="vallet-dialog-header">
                <h2 id="titulo-editor-vaga">
                  {modalVagas === "editar"
                    ? "Editar vaga"
                    : modalVagas === "lote"
                      ? "Gerar lote"
                      : "Adicionar vaga"}
                </h2>
                <button
                  type="button"
                  className="vallet-icon-btn"
                  aria-label="Fechar editor de vagas"
                  onClick={fecharModal}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </header>
              <div className="vallet-dialog-grid">
                {modoVagas === "lote" ? (
                  <>
                    <label className="vallet-field">
                      <span className="vallet-label">Quantidade</span>
                      <input
                        autoFocus
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        required
                        value={rascunhoVaga.quantidade}
                        onChange={(event) =>
                          setRascunhoVaga({
                            ...rascunhoVaga,
                            quantidade: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="vallet-field">
                      <span className="vallet-label">Prefixo</span>
                      <input
                        maxLength="90"
                        placeholder="A-"
                        value={rascunhoVaga.prefixo}
                        onChange={(event) =>
                          setRascunhoVaga({
                            ...rascunhoVaga,
                            prefixo: event.target.value,
                          })
                        }
                      />
                    </label>
                  </>
                ) : (
                  <label className="vallet-field">
                    <span className="vallet-label">Identificador</span>
                    <input
                      autoFocus
                      required
                      maxLength="100"
                      value={rascunhoVaga.numero}
                      onChange={(event) =>
                        setRascunhoVaga({
                          ...rascunhoVaga,
                          numero: event.target.value,
                        })
                      }
                    />
                  </label>
                )}
                
                <label className="vallet-field">
                  <span className="vallet-label">Tipo da vaga</span>
                  <select
                    value={rascunhoVaga.tipo}
                    onChange={(event) =>
                      setRascunhoVaga({
                        ...rascunhoVaga,
                        tipo: event.target.value,
                      })
                    }
                  >
                    <option value="Comum">Comum</option>
                    <option value="IdosoPcd">Idoso / PCD</option>
                    <option value="Moto">Moto</option>
                  </select>
                </label>
                
                <label className="vallet-field">
                  <span className="vallet-label">Setor / localização</span>
                  <input
                    maxLength="200"
                    value={rascunhoVaga.localizacao}
                    onChange={(event) =>
                      setRascunhoVaga({
                        ...rascunhoVaga,
                        localizacao: event.target.value,
                      })
                    }
                  />
                </label>
                
                <label className="vallet-field">
                  <span className="vallet-label">Valor por hora</span>
                  <div className="vallet-currency-input">
                    <span className="vallet-currency-prefix">R$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={rascunhoVaga.preco}
                      onChange={(event) =>
                        setRascunhoVaga({
                          ...rascunhoVaga,
                          preco: event.target.value,
                        })
                      }
                    />
                  </div>
                </label>
              </div>

              {erroVagas && (
                <p className="vallet-dialog-error" role="alert">
                  {erroVagas}
                </p>
              )}
              
              <footer className="vallet-dialog-footer">
                <button
                  type="button"
                  className="vallet-btn-clear"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="vallet-btn-primary">
                  {modalVagas === "editar"
                    ? "Salvar alterações"
                    : modalVagas === "lote"
                      ? "Adicionar lote"
                      : "Adicionar vaga"}
                </button>
              </footer>
            </form>
          </dialog>
        )}
      </div>
    </Layout>
  );
}