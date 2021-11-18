import KnowledgeBaseContent from "../../../components/knowledge-base/KnowledgeBaseSection";
import KnowledgeBaseTree from "../../../components/knowledge-base/KnowledgeBaseTree";
import Layout from "../../../components/Layout";
import withAuth from "../../../hocs/withAuth";

const KnowledgeBase = () => {
  return (
    <Layout title="Base de connaissances">
      <h1 className="px-8 py-3 font-bold text-lg">Base de connaissances</h1>
      <div className="flex h-full w-full  border-t-2">
        <KnowledgeBaseContent />
        <KnowledgeBaseTree />
      </div>
    </Layout>
  );
};

export default withAuth(KnowledgeBase);
