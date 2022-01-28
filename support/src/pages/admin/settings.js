import Header from "../../components/Header";
import Layout from "../../components/Layout";
import WIP from "../../components/WIP";
import withAuth from "../../hocs/withAuth";

const Admin = () => {
  return (
    <Layout title="Réglages" className="flex flex-col">
      <Header>Réglages</Header>
      <WIP title="Bienvenue dans les réglages !" />
    </Layout>
  );
};

export default withAuth(Admin);
