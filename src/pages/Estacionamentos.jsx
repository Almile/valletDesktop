import Layout from "../components/Layout";
export default function Estacionamentos() {
  return (
    <Layout title="Estacionamentos">
      <section className="empty-state">
        <span>▣</span>
        <h2>Nenhum estacionamento cadastrado</h2>
        <p>O formulário de cadastro será implementado na próxima etapa.</p>
        <button className="primary-button" disabled>
          Novo estacionamento
        </button>
      </section>
    </Layout>
  );
}
