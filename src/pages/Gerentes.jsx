import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { applyMask, formatPhone } from "../utils/inputMasks";

export default function Gerentes() {
  return (
    <Layout title="Gerentes">
      <section className="list-card">
        <header className="list-header">
          <div>
            <h2>Gerentes cadastrados</h2>
            <p>Consulte os responsáveis vinculados aos estacionamentos.</p>
          </div>
          <Link className="primary-link" to="/gerentes/novo">
            + Novo gerente
          </Link>
        </header>

        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th>Gerente</th>
                <th>Contato</th>
                <th>Estacionamento</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              <tr className="table-empty-row">
                <td colSpan="5">
                  <div className="table-empty-state">
                    <span>♙</span>
                    <strong>Nenhum gerente cadastrado</strong>
                    <p>Os gerentes aparecerão aqui após o cadastro.</p>
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

export function CadastroGerente() {
  function handleSubmit(event) {
    event.preventDefault();
    window.alert("Formulário pronto para ser conectado à API.");
  }

  return (
    <Layout title="Cadastrar gerente">
      <section className="form-card">
        <header className="form-header">
          <div>
            <h2>Dados do usuário gerente</h2>
            <p>
              Crie o acesso do gerente e associe-o ao estacionamento
              responsável.
            </p>
          </div>
        </header>

        <form className="registration-form" onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend>Informações pessoais</legend>
            <div className="form-grid">
              <label className="form-field form-field--wide">
                <span>Nome completo</span>
                <input
                  name="nome"
                  type="text"
                  placeholder="Nome do gerente"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="form-field">
                <span>Cargo</span>
                <input name="cargo" type="text" value="Gerente" readOnly />
              </label>
              <label className="form-field form-field--wide">
                <span>E-mail</span>
                <input
                  name="email"
                  type="email"
                  placeholder="gerente@empresa.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="form-field">
                <span>Telefone</span>
                <input
                  name="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  maxLength="15"
                  onChange={applyMask(formatPhone)}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Vínculo e acesso</legend>
            <div className="form-grid">
              <label className="form-field form-field--full">
                <span>Estacionamento</span>
                <select name="estacionamentoId" defaultValue="" required>
                  <option value="" disabled>
                    Selecione um estacionamento cadastrado
                  </option>
                  <option value="estacionamento-exemplo">
                    Estacionamento de exemplo (teste visual)
                  </option>
                </select>
                <small>
                  A lista será preenchida com os estacionamentos cadastrados
                  pelo administrador.
                </small>
              </label>
              <label className="form-field">
                <span>Senha provisória</span>
                <input
                  name="senha"
                  type="password"
                  minLength="6"
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="form-field">
                <span>Confirmar senha</span>
                <input
                  name="confirmacaoSenha"
                  type="password"
                  minLength="6"
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  required
                />
              </label>
            </div>
          </fieldset>

          <footer className="form-actions">
            <Link className="cancel-link" to="/gerentes">
              Cancelar
            </Link>
            <button className="secondary-action" type="reset">
              Limpar
            </button>
            <button className="primary-button" type="submit">
              Cadastrar gerente
            </button>
          </footer>
        </form>
      </section>
    </Layout>
  );
}
