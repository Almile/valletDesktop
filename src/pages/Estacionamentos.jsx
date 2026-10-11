import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { apiService } from "../services/api";
import {
  applyMask,
  formatCep,
  formatCnpj,
  formatPhone,
} from "../utils/inputMasks";

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
  const [possuiVagasPcd, setPossuiVagasPcd] = useState(false);
  const [possuiVagasIdoso, setPossuiVagasIdoso] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [funciona24h, setFunciona24h] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function carregarAdmins() {
      try {
        const listaAdmins = await apiService.getAdmins();
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

  function quantidadePcd(est) {
    const separadas =
      Number(est?.quantidadeVagasPcd || 0) +
      Number(est?.quantidadeVagasIdoso || 0);
    return separadas > 0
      ? Number(est?.quantidadeVagasPcd || 0)
      : Number(est?.quantidadeVagasIdosoPcd || 0);
  }

  function restaurarOpcoes(est) {
    setFunciona24h(est?.funciona24h === true);
    setPossuiVagasPcd(est?.possuiVagasPcd === true || quantidadePcd(est) > 0);
    setPossuiVagasIdoso(
      est?.possuiVagasIdoso === true ||
        Number(est?.quantidadeVagasIdoso || 0) > 0,
    );
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
    if (campo === "totalVagas")
      return est.quantidadeVagasTotal ?? est.totalVagas ?? "";
    if (campo === "quantidadeVagasPcd") return quantidadePcd(est);
    if (campo === "quantidadeVagasIdoso") return est.quantidadeVagasIdoso ?? 0;
    if (campo === "horarioAbertura" || campo === "horarioFechamento") {
      return (est[campo] || "").replace(/^(\d):/, "0$1:");
    }
    return est[campo] ?? "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
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

      quantidadeVagasTotal: Number(data.totalVagas),
      quantidadeVagasComum:
        Number(data.totalVagas) -
        (possuiVagasPcd ? Number(data.quantidadeVagasPcd || 0) : 0) -
        (possuiVagasIdoso ? Number(data.quantidadeVagasIdoso || 0) : 0),
      quantidadeVagasIdosoPcd:
        (possuiVagasPcd ? Number(data.quantidadeVagasPcd || 0) : 0) +
        (possuiVagasIdoso ? Number(data.quantidadeVagasIdoso || 0) : 0),
      tiposVagasComum: true,
      tiposVagasIdosoPcd: possuiVagasPcd || possuiVagasIdoso,
      possuiVagasPcd: possuiVagasPcd,
      quantidadeVagasPcd: possuiVagasPcd
        ? Number(data.quantidadeVagasPcd || 0)
        : 0,
      possuiVagasIdoso: possuiVagasIdoso,
      quantidadeVagasIdoso: possuiVagasIdoso
        ? Number(data.quantidadeVagasIdoso || 0)
        : 0,

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
    if (payload.quantidadeVagasComum < 0) {
      setErrorMessage(
        "A soma das vagas PCD e para idosos não pode superar o total de vagas.",
      );
      setSubmitting(false);
      return;
    }
    payload.tiposVagasComum = payload.quantidadeVagasComum > 0;
    try {
      if (editando) {
        await apiService.atualizarEstacionamento(estacionamentoId, payload);
      } else {
        await apiService.criarEstacionamento(payload);
      }
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

  return (
    <Layout
      title={editando ? "Editar estacionamento" : "Cadastrar estacionamento"}
    >
      <section className="form-card">
        <header className="form-header">
          <div>
            <h2>Dados do estacionamento</h2>
            <p>
              Preencha as informações do local e defina a quantidade de vagas.
            </p>
          </div>
        </header>

        {errorMessage && (
          <div
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
          onReset={() => restaurarOpcoes(dadosIniciais)}
        >
          <fieldset className="form-section">
            <legend>Informações principais</legend>
            <div className="form-grid">
              <label className="form-field form-field--wide">
                <span>Nome do estacionamento</span>
                <input
                  name="nome"
                  type="text"
                  placeholder="Ex.: Estacionamento Central"
                  required
                  defaultValue={valorInicial("nome")}
                />
              </label>

              <label className="form-field form-field--wide">
                <span>Administrador Responsável (adminUid)</span>
                {admins.length > 0 ? (
                  <select
                    name="adminUid"
                    required
                    defaultValue={dadosIniciais?.adminUid || ""}
                  >
                    <option value="" disabled>
                      Selecione um administrador
                    </option>
                    {dadosIniciais?.adminUid &&
                      !admins.some(
                        (adm) => (adm.uid || adm.id) === dadosIniciais.adminUid,
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
                  inputMode="numeric"
                  placeholder="00000-000"
                  maxLength="9"
                  onChange={applyMask(formatCep)}
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
                  required
                  defaultValue={valorInicial("uf")}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Funcionamento, vagas e valores</legend>
            <div className="form-grid parking-capacity-grid">
              <label className="form-field">
                <span>Quantidade total de vagas</span>
                <input
                  name="totalVagas"
                  type="number"
                  min="1"
                  placeholder="50"
                  required
                  defaultValue={valorInicial("totalVagas")}
                />
              </label>
              <label className="form-field">
                <span>Possui vagas para PCDs?</span>
                <select
                  name="possuiVagasPcd"
                  value={possuiVagasPcd ? "sim" : "nao"}
                  onChange={(event) =>
                    setPossuiVagasPcd(event.target.value === "sim")
                  }
                  required
                >
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </label>
              <label className="form-field">
                <span>Quantidade de vagas PCD</span>
                <input
                  name="quantidadeVagasPcd"
                  type="number"
                  min="0"
                  placeholder="0"
                  disabled={!possuiVagasPcd}
                  required={possuiVagasPcd}
                  defaultValue={valorInicial("quantidadeVagasPcd")}
                />
              </label>
              <label className="form-field">
                <span>Possui vagas para idosos?</span>
                <select
                  name="possuiVagasIdoso"
                  value={possuiVagasIdoso ? "sim" : "nao"}
                  onChange={(event) =>
                    setPossuiVagasIdoso(event.target.value === "sim")
                  }
                  required
                >
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </label>
              <label className="form-field">
                <span>Quantidade de vagas para idosos</span>
                <input
                  name="quantidadeVagasIdoso"
                  type="number"
                  min="0"
                  placeholder="0"
                  disabled={!possuiVagasIdoso}
                  required={possuiVagasIdoso}
                  defaultValue={valorInicial("quantidadeVagasIdoso")}
                />
              </label>
            </div>

            <div className="form-subsection">
              <h3>Valor e horários</h3>
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
                    aria-describedby="funcionamento-descricao"
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
              <p
                id="funcionamento-descricao"
                className="operating-hours-description"
              >
                {funciona24h
                  ? "Aberto todos os dias, durante 24 horas."
                  : "Informe os horários de abertura e fechamento."}
              </p>
            </div>
          </fieldset>

          <footer className="form-actions">
            <Link className="cancel-link" to="/estacionamentos">
              Cancelar
            </Link>
            <button className="secondary-action" type="reset">
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
      </section>
    </Layout>
  );
}
