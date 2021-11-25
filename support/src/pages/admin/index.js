import Layout from "../../components/Layout";
import WIP from "../../components/WIP";
import withAuth from "../../hocs/withAuth";

const Admin = () => {
  return (
    <Layout title="Tableau de bord">
      <WIP title="Bienvenue sur le tableau de bord !" />
    </Layout>
  );
};

export default withAuth(Admin);
