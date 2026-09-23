import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

        {error && <div className="error-message" style={{ color: "red", padding: "10px" }}>{error}</div>}

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
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
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
                      <Link className="empty-preview-link" to="/estacionamentos/novo">
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
                      <small>{est.endereco?.cidade || est.cidade} - {est.endereco?.uf || est.uf}</small>
                    </td>
                    <td>{est.cnpj}</td>
                    <td>{est.quantidadeVagasTotal || est.vagas_total || 0}</td>
                    <td>
                      {est.horarioAbertura}h às {est.horarioFechamento}h
                    </td>
                    <td>
                      <span className="badge badge-success">Ativo</span>
                    </td>
                    <td>
                      <Link to={`/estacionamentos/${est.id}`} className="table-action-btn">
                        Ver detalhes
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
  const [possuiVagasPcd, setPossuiVagasPcd] = useState(false);
  const [possuiVagasIdoso, setPossuiVagasIdoso] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function carregarAdmins() {
      try {
        const listaAdmins = await apiService.getAdmins();
        setAdmins(listaAdmins || []);
      } catch (err) {
        console.warn("Não foi possível carregar a lista de administradores:", err);
      }
    }
    carregarAdmins();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      nome: data.nome,
      cnpj: data.cnpj,
      telefone: data.telefone,
      adminUid: data.adminUid,
      
      endereco: {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento || "",
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
      },

      totalVagas: Number(data.totalVagas),
      possuiVagasPcd: possuiVagasPcd,
      quantidadeVagasPcd: possuiVagasPcd ? Number(data.quantidadeVagasPcd || 0) : 0,
      possuiVagasIdoso: possuiVagasIdoso,
      quantidadeVagasIdoso: possuiVagasIdoso ? Number(data.quantidadeVagasIdoso || 0) : 0,

      valorHora: parseFloat(data.valorHora),
      horarioAbertura: data.horarioAbertura,
      horarioFechamento: data.horarioFechamento,
    };

    try {
      await apiService.criarEstacionamento(payload);
      alert("Estacionamento cadastrado com sucesso!");
      navigate("/estacionamentos");
    } catch (err) {
      setErrorMessage(err.message || "Erro ao cadastrar estacionamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout title="Cadastrar estacionamento">
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
          <div style={{ color: "red", backgroundColor: "#ffe6e6", padding: "12px", borderRadius: "6px", margin: "16px 24px" }}>
            {errorMessage}
          </div>
        )}

        <form className="registration-form" onSubmit={handleSubmit}>
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
                />
              </label>

              <label className="form-field form-field--wide">
                <span>Administrador Responsável (adminUid)</span>
                {admins.length > 0 ? (
                  <select name="adminUid" required defaultValue="">
                    <option value="" disabled>Selecione um administrador</option>
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
                />
              </label>
              <label className="form-field address-field--street">
                <span>Logradouro</span>
                <input
                  name="logradouro"
                  type="text"
                  placeholder="Rua, avenida ou travessa"
                  required
                />
              </label>
              <label className="form-field address-field--complement">
                <span>Complemento</span>
                <input
                  name="complemento"
                  type="text"
                  placeholder="Bloco, sala ou referência"
                />
              </label>
              <label className="form-field address-field--number">
                <span>Número</span>
                <input name="numero" type="text" placeholder="123" required />
              </label>
              <label className="form-field address-field--district">
                <span>Bairro</span>
                <input
                  name="bairro"
                  type="text"
                  placeholder="Bairro"
                  required
                />
              </label>
              <label className="form-field address-field--city">
                <span>Cidade</span>
                <input
                  name="cidade"
                  type="text"
                  placeholder="Cidade"
                  required
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
                  defaultValue="0"
                  disabled={!possuiVagasPcd}
                  required={possuiVagasPcd}
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
                  defaultValue="0"
                  disabled={!possuiVagasIdoso}
                  required={possuiVagasIdoso}
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
                    />
                  </div>
                </label>
                <label className="form-field">
                  <span>Horário de abertura</span>
                  <input name="horarioAbertura" type="time" required />
                </label>
                <label className="form-field">
                  <span>Horário de fechamento</span>
                  <input name="horarioFechamento" type="time" required />
                </label>
              </div>
            </div>
          </fieldset>

          <footer className="form-actions">
            <Link className="cancel-link" to="/estacionamentos">
              Cancelar
            </Link>
            <button className="secondary-action" type="reset">
              Limpar
            </button>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Cadastrando..." : "Cadastrar estacionamento"}
            </button>
          </footer>
        </form>
      </section>
    </Layout>
  );
}