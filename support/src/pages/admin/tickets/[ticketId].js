import Header from "../../../components/Header";
import Layout from "../../../components/Layout";
import withAuth from "../../../hocs/withAuth";

const Tickets = () => {
  return (
    <>
      <Layout title="Tickets" className="flex flex-col">
        <Header>🚧 Ticket (EN COURS DE DÉVELOPPEMENT) 🚧</Header>
      </Layout>
    </>
  );
};

export default withAuth(Tickets);
