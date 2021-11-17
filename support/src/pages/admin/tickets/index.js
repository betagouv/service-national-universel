import Layout from "../../../components/Layout";
import WIP from "../../../components/WIP";
import withAuth from "../../../hocs/withAuth";

const KnowledgeBase = () => {
  return (
    <>
      <Layout title="Tickets">
        <WIP title="Bienvenue sur la pages tickets !" />
      </Layout>
    </>
  );
};

export default withAuth(KnowledgeBase);
