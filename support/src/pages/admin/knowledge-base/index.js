import Layout from "../../../components/Layout";
import withAuth from "../../../hocs/withAuth";

const KnowledgeBase = () => {
  return <Layout title="Base de connaissances"></Layout>;
};

export default withAuth(KnowledgeBase);
