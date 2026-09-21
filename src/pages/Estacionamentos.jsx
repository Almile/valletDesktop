import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import {
  applyMask,
  formatCep,
  formatCnpj,
  formatPhone,
} from "../utils/inputMasks";

export default function Estacionamentos() {
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
              <tr className="table-empty-row">
                <td colSpan="6">
                  <div className="table-empty-state">
                    <span>▣</span>
                    <strong>Nenhum estacionamento cadastrado</strong>
                    <p>Os estacionamentos aparecerão aqui após o cadastro.</p>
                    <Link
                      className="empty-preview-link"
                      to="/estacionamentos/exemplo"
                    >
                      Visualizar modelo da página de dados
                    </Link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

export function CadastroEstacionamento() {
  const [possuiVagasPcd, setPossuiVagasPcd] = useState(false);
  const [possuiVagasIdoso, setPossuiVagasIdoso] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    window.alert("Formulário pronto para ser conectado à API.");
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
                      placeholder="10,00"
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
            <button className="primary-button" type="submit">
              Cadastrar estacionamento
            </button>
          </footer>
        </form>
      </section>
    </Layout>
  );
}
