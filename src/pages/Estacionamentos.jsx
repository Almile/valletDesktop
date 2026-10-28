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

  return (
    <Layout title="Estacionamentos">
      <section className="list-card">
        <header className="list-header">
          <div>
            <h2>Estacionamentos cadastrados</h2>
            <p>Visualize e gerencie todas as unidades do sistema.</p>
          </div>
          <Link className="primary-link" to="/estacionamentos/novo">
            + Novo estacionamento
          </Link>
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
              ) : (
                estacionamentos.map((est) => (
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
                      <span className="badge badge-success">Ativo</span>
                    </td>
                    <td>
                      <Link
                        to={`/estacionamentos/${est.id}`}
                        className="table-action-btn"
                      >
                        <span>Ver detalhes</span>
                        <span aria-hidden="true">→</span>
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
  const [logradouro, setLogradouro] = useState("")
  const [cidade, setCidade] = useState("")
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
    if (data.possuiVagasPcd) setPossuiVagasPcd(data.possuiVagasPcd === "sim");
    if (data.possuiVagasIdoso) setPossuiVagasIdoso(data.possuiVagasIdoso === "sim");
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
    // TO-DO - enviar vagas cadastradas
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

  async function findCEP(cep) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json`);
      const data = await res.json();
      console.log(data);
      setCidade(data.localidade)
      setBairro(data.bairro)
      setLogradouro(data.logradouro)
      setUf(data.uf)
      return
    } catch (err) {
      console.warn("Cep não encontrado", err);
    }
  }

  return (
    <Layout
      title={editando ? "Editar estacionamento" : "Cadastrar estacionamento"}
    >
      <section className="form-card parking-registration">
        {errorMessage && (
          <div
            role="alert"
            style={{
              color: "red",
              backgroundColor: "#ffe6e6",
              padding: "12px",
              borderRadius: "6px",
              margin: "16px 24px",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form
          className="registration-form"
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
          <fieldset className="form-section">
            <legend>Dados do estacionamento</legend>
            <div className="form-grid">
              <label className="form-field">
                <span>Nome do estacionamento</span>
                <input
                  name="nome"
                  type="text"
                  placeholder="Ex.: Estacionamento Central"
                  required
                  defaultValue={valorInicial("nome")}
                />
              </label>

              <label className="form-field">
                <span>Administrador responsável</span>
                {admins.length > 0 ? (
                    <div className="selectebotao">
                       {/* TO-DO -  Alinhar o botão ou fazer o que voce quiser */}
                      <div className="field-action-link">
                        <Link class="parking-outline-button-admin" to="/estacionamentos/novo/gerente">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
                        </Link>
                      </div>
                      <select
                        name="adminUid"
                        required
                        defaultValue={dadosIniciais?.adminUid || ""}
                      >
                        <option value="" disabled>
                          Administradores Disponíveis
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
                    </div>
                  ) : (
                  <input
                    name="adminUid"
                    type="text"
                    placeholder="Informe o UID do administrador do Firestore"
                    required
                    defaultValue={valorInicial("adminUid")}
                  />
                )}
              </label>

              <label className="form-field">
                <span>CNPJ</span>
                <input
                  name="cnpj"
                  type="text"
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  maxLength="18"
                  onChange={applyMask(formatCnpj)}
                  required
                  defaultValue={valorInicial("cnpj")}
                />
              </label>
              <label className="form-field">
                <span>Telefone</span>
                <input
                  name="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  maxLength="15"
                  onChange={applyMask(formatPhone)}
                  required
                  defaultValue={valorInicial("telefone")}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Endereço</legend>
            <div className="form-grid address-grid">
              <label className="form-field address-field--cep">
                <span>CEP</span>
                <input
                  name="cep"
                  type="text"
                  value={cep}
                  inputMode="numeric"
                  placeholder="00000-000"
                  maxLength="9"
                  onChange={(e) => { applyMask(formatCep)(e); setCep(e.target.value);}}
                  onBlur={()=>{findCEP(cep)}}
                  required
                  defaultValue={valorInicial("cep")}
                />
              </label>
              <label className="form-field address-field--street">
                <span>Logradouro</span>
                <input
                  name="logradouro"
                  type="text"
                  placeholder="Rua, avenida ou travessa"
                  value={logradouro}
                  onChange={setLogradouro}
                  required
                  defaultValue={valorInicial("logradouro")}
                />
              </label>
              <label className="form-field address-field--complement">
                <span>Complemento</span>
                <input
                  name="complemento"
                  type="text"
                  placeholder="Bloco, sala ou referência"
                  defaultValue={valorInicial("complemento")}
                />
              </label>
              <label className="form-field address-field--number">
                <span>Número</span>
                <input
                  name="numero"
                  type="text"
                  placeholder="123"
                  required
                  defaultValue={valorInicial("numero")}
                />
              </label>
              <label className="form-field address-field--district">
                <span>Bairro</span>
                <input
                  name="bairro"
                  type="text"
                  placeholder="Bairro"
                  value={bairro}
                  onChange={setBairro}
                  required
                  defaultValue={valorInicial("bairro")}
                />
              </label>
              <label className="form-field address-field--city">
                <span>Cidade</span>
                <input
                  name="cidade"
                  type="text"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={setCidade}
                  required
                  defaultValue={valorInicial("cidade")}
                />
              </label>
              <label className="form-field address-field--state">
                <span>UF</span>
                <input
                  name="uf"
                  type="text"
                  maxLength="2"
                  placeholder="SP"
                  value={uf}
                  onChange={setUf}
                  required
                  defaultValue={valorInicial("uf")}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Funcionamento e valores</legend>
            <div className="form-subsection">
              <div className="operation-fields-grid">
                <label className="form-field">
                  <span>Valor base por hora</span>
                  <div className="currency-input">
                    <span className="currency-prefix">R$</span>
                    <input
                      name="valorHora"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="10.00"
                      required
                      defaultValue={valorInicial("valorHora")}
                    />
                  </div>
                </label>
                <label className="form-field">
                  <span>Horário de abertura</span>
                  <input
                    name="horarioAbertura"
                    type="time"
                    disabled={funciona24h}
                    required={!funciona24h}
                    defaultValue={valorInicial("horarioAbertura")}
                  />
                </label>
                <label className="form-field">
                  <span>Horário de fechamento</span>
                  <input
                    name="horarioFechamento"
                    type="time"
                    disabled={funciona24h}
                    required={!funciona24h}
                    defaultValue={valorInicial("horarioFechamento")}
                  />
                </label>
                <div className="form-field">
                  <span>Funcionamento 24h</span>
                  <button
                    className="operating-hours-toggle"
                    type="button"
                    role="switch"
                    aria-checked={funciona24h}
                    onClick={() => setFunciona24h((ativo) => !ativo)}
                  >
                    <span
                      className="operating-hours-toggle-track"
                      aria-hidden="true"
                    >
                      <span className="operating-hours-toggle-thumb" />
                    </span>
                    <span>Funciona 24 horas</span>
                  </button>
                </div>
              </div>
            </div>
          </fieldset>

          {!editando ? (
            <section
              className="parking-vacancies"
              aria-labelledby="titulo-vagas"
            >
              <div className="parking-vacancies-header">
                <h2 id="titulo-vagas">
                  Vagas do estacionamento{" "}
                  <span className="parking-count" aria-live="polite">
                    {vagasIniciais.length}
                  </span>
                </h2>
                <div className="parking-vacancies-tools">
                  <button
                    type="button"
                    data-adicionar-vaga
                    className="parking-outline-button"
                    disabled={submitting}
                    onClick={() => abrirModal("individual")}
                  >
                    <IconeVaga tipo="adicionar" />
                    Adicionar vaga
                  </button>
                  <button
                    type="button"
                    className="parking-outline-button"
                    disabled={submitting}
                    onClick={() => abrirModal("lote")}
                  >
                    <IconeVaga tipo="lote" />
                    Gerar lote
                  </button>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="parking-vacancies-table">
                  <thead>
                    <tr>
                      <th>Identificador</th>
                      <th>Tipo</th>
                      <th>Setor</th>
                      <th>Valor / hora</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* TO-DO atualmente ordenando por ultimo adicionado, ordenar por ordem alfabética */}
                    {vagasVisiveis.length ? (
                      vagasVisiveis.map((vaga, indice) => (
                        <tr key={vaga.numero}>
                          <td>{vaga.numero}</td>
                          <td>
                            {vaga.tipo === "IdosoPcd"
                              ? "Idoso / PCD"
                              : vaga.tipo}
                          </td>
                          <td>{vaga.localizacao || "—"}</td>
                          <td>
                            {vaga.preco.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>
                          <td>
                            <div className="parking-row-actions">
                              <button
                                type="button"
                                className="parking-icon-button"
                                disabled={submitting}
                                aria-label={`Editar vaga ${vaga.numero}`}
                                title="Editar vaga"
                                onClick={() =>
                                  abrirModal("editar", inicioPagina + indice)
                                }
                              >
                                <IconeVaga tipo="editar" />
                              </button>
                              <button
                                type="button"
                                className="parking-icon-button parking-icon-button--danger"
                                disabled={submitting}
                                aria-label={`Excluir vaga ${vaga.numero}`}
                                title="Excluir vaga"
                                onClick={() =>
                                  excluirVaga(inicioPagina + indice)
                                }
                              >
                                <IconeVaga tipo="excluir" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="parking-empty">
                          Nenhuma vaga cadastrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {vagasIniciais.length > 0 && (
                <div className="parking-pagination-bar">
                  <span aria-live="polite">
                    {inicioPagina + 1}–
                    {Math.min(
                      inicioPagina + vagasPorPagina,
                      vagasIniciais.length,
                    )}{" "}
                    de {vagasIniciais.length} vagas
                  </span>
                  <nav
                    className="parking-pagination"
                    aria-label="Páginas de vagas"
                  >
                    <button
                      type="button"
                      aria-label="Página anterior"
                      disabled={paginaAtual === 1}
                      onClick={() => setPaginaVagas(paginaAtual - 1)}
                    >
                      ‹
                    </button>
                    {paginas.map((pagina, indice) => (
                      <span key={pagina}>
                        {indice > 0 && pagina - paginas[indice - 1] > 1 && (
                          <span className="parking-page-gap">…</span>
                        )}
                        <button
                          type="button"
                          aria-label={`Página ${pagina}`}
                          aria-current={
                            paginaAtual === pagina ? "page" : undefined
                          }
                          onClick={() => setPaginaVagas(pagina)}
                        >
                          {pagina}
                        </button>
                      </span>
                    ))}
                    <button
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
            </section>
          ) : (
            <div className="parking-edit-vacancies-link">
              <Link to={`/estacionamentos/${estacionamentoId}`}>
                Gerenciar vagas do estacionamento
              </Link>
            </div>
          )}

          <footer className="form-actions">
            <Link className="cancel-link" to="/estacionamentos">
              Cancelar
            </Link>
            <button
              className="secondary-action"
              type="reset"
              disabled={submitting}
            >
              {editando ? "Restaurar dados" : "Limpar"}
            </button>
            <button
              className="primary-button"
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
            className="parking-vacancy-dialog"
            aria-labelledby="titulo-editor-vaga"
            onCancel={(event) => {
              event.preventDefault();
              fecharModal();
            }}
          >
            <form onSubmit={adicionarVagas}>
              <header className="parking-dialog-header">
                <h2 id="titulo-editor-vaga">
                  {modalVagas === "editar"
                    ? "Editar vaga"
                    : modalVagas === "lote"
                      ? "Gerar lote"
                      : "Adicionar vaga"}
                </h2>
                <button
                  type="button"
                  className="parking-icon-button"
                  aria-label="Fechar editor de vagas"
                  onClick={fecharModal}
                >
                  ×
                </button>
              </header>
              <div className="parking-dialog-fields">
                {modoVagas === "lote" ? (
                  <>
                    <label className="form-field">
                      <span>Quantidade</span>
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
                    <label className="form-field">
                      <span>Prefixo</span>
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
                  <label className="form-field">
                    <span>Identificador</span>
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
                <label className="form-field">
                  <span>Tipo da vaga</span>
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
                <label className="form-field">
                  <span>Setor / localização</span>
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
                <label className="form-field">
                  <span>Valor por hora</span>
                  <div className="currency-input">
                    <span className="currency-prefix">R$</span>
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
                <p className="parking-dialog-error" role="alert">
                  {erroVagas}
                </p>
              )}
              <footer className="parking-dialog-actions">
                <button
                  type="button"
                  className="parking-outline-button"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
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
      </section>
    </Layout>
  );
}
