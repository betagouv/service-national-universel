import Header from "../../components/Header";
import Layout from "../../components/Layout";
import WIP from "../../components/WIP";
import withAuth from "../../hocs/withAuth";

const Admin = () => {
  return (
    <Layout title="Tableau de bord" className="flex flex-col">
      <Header>Tableau de bord</Header>
      <WIP title="Bienvenue sur le tableau de bord !" />
    </Layout>
  );
};

export default withAuth(Admin);
