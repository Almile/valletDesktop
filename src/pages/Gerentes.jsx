import Layout from "../components/Layout";
export default function Gerentes() {
  return (
    <Layout title="Gerentes">
      <section className="empty-state">
        <span>♙</span>
        <h2>Nenhum gerente cadastrado</h2>
        <p>
          Depois de cadastrar um estacionamento, você poderá associar gerentes a
          ele.
        </p>
        <button className="primary-button" disabled>
          Novo gerente
        </button>
      </section>
    </Layout>
  );
}
