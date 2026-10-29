import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";
import {
  applyMask,
  formatCep,
  formatCnpj,
  formatPhone,
} from "../utils/inputMasks";

function IconeVaga({ tipo }) {
  const caminhos = {
    editar: (
      <>
        <path d="m16 3 5 5M4 16 16 4a2.1 2.1 0 0 1 3 3L7 19l-4 1z" />
      </>
    ),
    excluir: (
      <>
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
      </>
    ),
    adicionar: <path d="M12 5v14M5 12h14" />,
    lote: (
      <>
        <path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" />
      </>
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

export default function Estacionamentos() {
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    carregarEstacionamentos();
  }, []);

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
                <th>Status</th>
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
                estacionamentosFiltrados.map((est) => (
                  <tr key={est.id || est.cnpj}>
                    <td>
                      <strong>{est.nome}</strong>
                      <br />
                      <small>
                        {[
                          est.endereco?.cidade ||
                            est.endereco?.localidade ||
                            est.cidade,
                          est.endereco?.uf || est.uf,
                        ]
                          .filter(Boolean)
                          .join(" - ") || "Cidade não informada"}
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
                      <span className="vallet-badge" style={{color: '#057153', background: '#e6f7f1'}}>Ativo</span>
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
  const [vagasIniciais, setVagasIniciais] = useState([]);
  const [modoVagas, setModoVagas] = useState("individual");
  const [erroVagas, setErroVagas] = useState("");
  const [modalVagas, setModalVagas] = useState(null);
  const [indiceEdicao, setIndiceEdicao] = useState(null);
  const [paginaVagas, setPaginaVagas] = useState(1);
  const dialogRef = useRef(null);
  const acionadorModal = useRef(null);
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [uf, setUf] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [cidade, setCidade] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const formularioRef = useRef(null);
  const vagasPorPagina = 5;
  const totalPaginas = Math.max(
    1,
    Math.ceil(vagasIniciais.length / vagasPorPagina),
  );
  const paginaAtual = Math.min(paginaVagas, totalPaginas);
  const inicioPagina = (paginaAtual - 1) * vagasPorPagina;
  const vagasVisiveis = vagasIniciais.slice(
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
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function carregarAdmins() {
      try {
        const listaAdmins = await apiService.getAdminsDisponiveis();
        setAdmins(listaAdmins || []);
      } catch (err) {
        console.warn(
          "Não foi possível carregar a lista de administradores:",
          err,
        );
      }
    }
    carregarAdmins();
  }, []);

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
            ...vagasIniciais[indice],
            preco: String(vagasIniciais[indice].preco),
          },
    );
    setErroVagas("");
    setModalVagas(modo);
  }

  function excluirVaga(indice) {
    const vaga = vagasIniciais[indice];
    if (!window.confirm(`Excluir a vaga ${vaga.numero}?`)) return;
    const restantes = vagasIniciais.filter((_, i) => i !== indice);
    setVagasIniciais(restantes);
    setPaginaVagas(
      Math.min(
        paginaAtual,
        Math.max(1, Math.ceil(restantes.length / vagasPorPagina)),
      ),
    );
  }

  function restaurarOpcoes(est) {
    setFunciona24h(est?.funciona24h === true);
    setVagasIniciais([]);
    setRascunhoVaga(vagaVazia);
    setErroVagas("");
    setPaginaVagas(1);
    setModalVagas(null);
  }

  function adicionarVagas(event) {
    event.preventDefault();
    setErroVagas("");
    const quantidade =
      modoVagas === "lote" ? Number(rascunhoVaga.quantidade) : 1;
    const preco = Number(rascunhoVaga.preco);
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 100) {
      setErroVagas("Informe de 1 a 100 vagas por lote.");
      return;
    }
    if (vagasIniciais.length + (indiceEdicao === null ? quantidade : 0) > 499) {
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
      vagasIniciais
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
    if (indiceEdicao !== null) {
      setVagasIniciais((atuais) =>
        atuais.map((vaga, indice) =>
          indice === indiceEdicao ? novas[0] : vaga,
        ),
      );
    } else {
      setVagasIniciais((atuais) => [...atuais, ...novas]);
      setPaginaVagas(Math.floor(vagasIniciais.length / vagasPorPagina) + 1);
    }
    fecharModal();
  }

  useEffect(() => {
    let ativo = true;
    setErrorMessage("");
    setDadosIniciais(null);
    if (!estacionamentoId) {
      restaurarOpcoes(null);
      setCarregandoDados(false);
      return () => {
        ativo = false;
      };
    }
    setCarregandoDados(true);
    apiService
      .getEstacionamentoPorId(estacionamentoId)
      .then((est) => {
        if (!ativo) return;
        setDadosIniciais(est);
        restaurarOpcoes(est);
        // Preenche os estados de endereço
        if (est.endereco && typeof est.endereco === "object") {
          setCep(est.endereco.cep || "");
          setLogradouro(est.endereco.logradouro || "");
          setBairro(est.endereco.bairro || "");
          setCidade(est.endereco.cidade || est.endereco.localidade || "");
          setUf(est.endereco.uf || "");
        } else if (typeof est.endereco === "string") {
          setLogradouro(est.endereco);
          setCep(est.cep || "");
          setBairro(est.bairro || "");
          setCidade(est.cidade || "");
          setUf(est.uf || "");
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
    const rascunho = sessionStorage.getItem("rascunhoEstacionamento");
    if (rascunho && !editando) {
      const data = JSON.parse(rascunho);
      Object.entries(data).forEach(([name, value]) => {
        const input = document.querySelector(`[name="${name}"]`);
        if (input) {
          if (input.type === "checkbox" || input.type === "radio") {
            input.checked = value === "on" || value === true;
          } else {
            input.value = value;
          }
        }
      });
      if (data.cep) setCep(data.cep);
      if (data.logradouro) setLogradouro(data.logradouro);
      if (data.bairro) setBairro(data.bairro);
      if (data.cidade) setCidade(data.cidade);
      if (data.uf) setUf(data.uf);
    }
  }, [editando]);

  function valorInicial(campo) {
    const est = dadosIniciais || {};
    const endereco =
      typeof est.endereco === "object" && est.endereco ? est.endereco : {};
    if (campo === "cidade")
      return endereco.cidade || endereco.localidade || est.cidade || "";
    if (campo === "logradouro" && typeof est.endereco === "string")
      return est.endereco;
    if (
      ["cep", "logradouro", "complemento", "numero", "bairro", "uf"].includes(
        campo,
      )
    ) {
      return endereco[campo] || est[campo] || "";
    }
    if (campo === "horarioAbertura" || campo === "horarioFechamento") {
      return (est[campo] || "").replace(/^(\d):/, "0$1:");
    }
    return est[campo] ?? "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    if (modalVagas) return;
    setErrorMessage("");
    setSubmitting(true);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const payload = {
      nome: data.nome.trim(),
      cnpj: data.cnpj,
      telefone: data.telefone,
      adminUid: data.adminUid,

      endereco: {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento || "",
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade.trim(),
        uf: data.uf.trim().toUpperCase(),
      },

      valorHora: parseFloat(data.valorHora),
      funciona24h,
      horarioAbertura: funciona24h ? "00:00" : data.horarioAbertura,
      horarioFechamento: funciona24h ? "00:00" : data.horarioFechamento,
    };

    if (!payload.endereco.cidade || !payload.nome) {
      setErrorMessage("Nome e cidade são obrigatórios.");
      setSubmitting(false);
      return;
    }
    if (!editando) payload.vagasIniciais = vagasIniciais;
    try {
      if (arquivoImagem) {
      const formUpload = new FormData();
      formUpload.append("file", arquivoImagem);
      const upload = await apiService.uploadImagem(formUpload);
      payload.fotoEstacionamentoUri = upload.url;
    }
      if (editando) {
        await apiService.atualizarEstacionamento(estacionamentoId, payload);
      } else {
        await apiService.criarEstacionamento(payload);
      }
      sessionStorage.removeItem("rascunhoEstacionamento");

      alert(
        editando
          ? "Estacionamento atualizado com sucesso!"
          : "Estacionamento cadastrado com sucesso!",
      );
      navigate(
        editando ? `/estacionamentos/${estacionamentoId}` : "/estacionamentos",
      );
    } catch (err) {
      setErrorMessage(err.message || "Erro ao cadastrar estacionamento.");
    } finally {
      setSubmitting(false);
    }
  }

  if (carregandoDados || (editando && !dadosIniciais)) {
    return (
      <Layout title="Editar estacionamento">
        <p role={errorMessage ? "alert" : "status"}>
          {errorMessage || "Carregando estacionamento..."}
        </p>
        <Link to="/estacionamentos">Voltar para estacionamentos</Link>
      </Layout>
    );
  }

  async function findCEP(cepBusca) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepBusca}/json`);
      const data = await res.json();
      if (!data.erro) {
        setCidade(data.localidade || "");
        setBairro(data.bairro || "");
        setLogradouro(data.logradouro || "");
        setUf(data.uf || "");
      }
    } catch (err) {
      console.warn("Cep não encontrado", err);
    }
  }

  return (
    <Layout
      title={editando ? "Editar estacionamento" : "Cadastrar estacionamento"}
    >
      <div className="vallet-form-container">
        {errorMessage && (
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
            {errorMessage}
          </div>
        )}

        <form
          ref={formularioRef}
          onSubmit={handleSubmit}
          key={estacionamentoId || "novo"}
          onReset={() => {
            restaurarOpcoes(dadosIniciais);
            sessionStorage.removeItem("rascunhoEstacionamento");
          }}
          onChange={(e) => {
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            sessionStorage.setItem("rascunhoEstacionamento", JSON.stringify(data));
          }}
        >
          {/* SEÇÃO: Dados do estacionamento */}
          <div className="vallet-section">
            <h2 className="vallet-section-title">Dados do estacionamento</h2>
            <hr className="vallet-divider" />
            <label className="form-field">
            <span>Foto do estacionamento</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setArquivoImagem(file);
                  setPreviewImagem(URL.createObjectURL(file));
                }
              }}
            />
            {previewImagem && (
              <img
                src={previewImagem}
                alt="Pré-visualização"
                style={{ maxWidth: "200px", marginTop: "8px", borderRadius: "6px" }}
              />
            )}
          </label>
            {/* Primeira linha */}
            <div className="vallet-grid-row-1">
              <label className="vallet-field">
                <span className="vallet-label">Nome</span>
                <input
                  name="nome"
                  type="text"
                  placeholder="Vallet Centro"
                  required
                  defaultValue={valorInicial("nome")}
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">CNPJ</span>
                <input
                  name="cnpj"
                  type="text"
                  inputMode="numeric"
                  placeholder="12.345.678/0001-90"
                  maxLength="18"
                  onChange={applyMask(formatCnpj)}
                  required
                  defaultValue={valorInicial("cnpj")}
                />
              </label>

              <div className="vallet-field">
                <span className="vallet-label">Administrador responsável</span>
                <div className="vallet-admin-wrapper">
                  <Link
                    className="vallet-add-admin-btn"
                    to="/estacionamentos/novo/gerente"
                    title="Adicionar administrador"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 5v14M5 12h14"/></svg>
                  </Link>
                  {admins.length > 0 ? (
                    <select
                      name="adminUid"
                      required
                      defaultValue={dadosIniciais?.adminUid || ""}
                    >
                      <option value="" disabled>
                        Selecione...
                      </option>
                      {dadosIniciais?.adminUid &&
                        !admins.some(
                          (adm) => (adm.uid || adm.id) === dadosIniciais.adminUid
                        ) && (
                          <option value={dadosIniciais.adminUid}>
                            {dadosIniciais.adminEmail || dadosIniciais.adminUid}
                          </option>
                        )}
                      {admins.map((adm) => (
                        <option key={adm.uid || adm.id} value={adm.uid || adm.id}>
                          {adm.nome || adm.email} ({adm.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="adminUid"
                      type="text"
                      placeholder="UID do administrador"
                      required
                      defaultValue={valorInicial("adminUid")}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Segunda linha */}
            <div className="vallet-grid-row-2">
              <label className="vallet-field">
                <span className="vallet-label">Telefone</span>
                <input
                  name="telefone"
                  type="tel"
                  placeholder="(13) 99999-1234"
                  maxLength="15"
                  onChange={applyMask(formatPhone)}
                  required
                  defaultValue={valorInicial("telefone")}
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">CEP</span>
                <input
                  name="cep"
                  type="text"
                  value={cep}
                  inputMode="numeric"
                  placeholder="11010-000"
                  maxLength="9"
                  onChange={(e) => { applyMask(formatCep)(e); setCep(e.target.value);}}
                  onBlur={()=>{findCEP(cep)}}
                  required
                  defaultValue={valorInicial("cep")}
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Cidade</span>
                <input
                  name="cidade"
                  type="text"
                  placeholder="Santos"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                  defaultValue={valorInicial("cidade")}
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">UF</span>
                <input
                  name="uf"
                  type="text"
                  maxLength="2"
                  placeholder="SP"
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  required
                  defaultValue={valorInicial("uf")}
                />
              </label>
            </div>

            {/* Terceira linha */}
            <div className="vallet-grid-row-3">
              <label className="vallet-field">
                <span className="vallet-label">Logradouro</span>
                <input
                  name="logradouro"
                  type="text"
                  placeholder="Rua João Pessoa"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  required
                  defaultValue={valorInicial("logradouro")}
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Número</span>
                <input
                  name="numero"
                  type="text"
                  placeholder="120"
                  required
                  defaultValue={valorInicial("numero")}
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Bairro</span>
                <input
                  name="bairro"
                  type="text"
                  placeholder="Centro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  required
                  defaultValue={valorInicial("bairro")}
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Complemento</span>
                <input
                  name="complemento"
                  type="text"
                  placeholder="Opcional"
                  defaultValue={valorInicial("complemento")}
                />
              </label>
            </div>
          </div>

          {/* SEÇÃO: Funcionamento e valores */}
          <div className="vallet-section">
            <h2 className="vallet-section-title">Funcionamento e valores</h2>
            <hr className="vallet-divider" />
            
            <div className="vallet-grid-operation">
              <label className="vallet-field">
                <span className="vallet-label">Valor por hora</span>
                <div className="vallet-currency-input">
                  <span className="vallet-currency-prefix">R$</span>
                  <input
                    name="valorHora"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="15.00"
                    required
                    defaultValue={valorInicial("valorHora")}
                  />
                </div>
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Abertura</span>
                <input
                  name="horarioAbertura"
                  type="time"
                  disabled={funciona24h}
                  required={!funciona24h}
                  defaultValue={valorInicial("horarioAbertura")}
                />
              </label>

              <label className="vallet-field">
                <span className="vallet-label">Fechamento</span>
                <input
                  name="horarioFechamento"
                  type="time"
                  disabled={funciona24h}
                  required={!funciona24h}
                  defaultValue={valorInicial("horarioFechamento")}
                />
              </label>

              <div className="vallet-field-switch">
                <button
                  className="vallet-toggle"
                  type="button"
                  role="switch"
                  aria-checked={funciona24h}
                  onClick={() => setFunciona24h((ativo) => !ativo)}
                >
                  <span
                    className="vallet-toggle-track"
                    aria-hidden="true"
                  >
                    <span className="vallet-toggle-thumb" />
                  </span>
                  <span>Funciona 24 horas</span>
                </button>
              </div>
            </div>
          </div>

          {/* SEÇÃO: Vagas do estacionamento */}
          {!editando ? (
            <div className="vallet-section" aria-labelledby="titulo-vagas">
              <div className="vallet-vacancies-header">
                <h2 id="titulo-vagas" className="vallet-vacancies-title">
                  Vagas do estacionamento
                  <span className="vallet-badge" aria-live="polite">
                    {vagasIniciais.length}
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

              {vagasIniciais.length > 0 && (
                <div className="vallet-pagination-bar">
                  <span aria-live="polite">
                    {inicioPagina + 1}–
                    {Math.min(
                      inicioPagina + vagasPorPagina,
                      vagasIniciais.length,
                    )}{" "}
                    de {vagasIniciais.length} vagas
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
          ) : (
            <div style={{ paddingBottom: "20px", fontSize: "14px" }}>
              <Link to={`/estacionamentos/${estacionamentoId}`} style={{ color: "var(--main-color)" }}>
                Gerenciar vagas deste estacionamento
              </Link>
            </div>
          )}

          <footer className="vallet-form-footer">
            <Link className="vallet-cancel-link" to="/estacionamentos">
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