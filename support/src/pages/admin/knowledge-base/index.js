import KnowledgeBaseCard from "../../../components/knowledge-base/KnowledgeBaseCard";
import KnowledgeBaseNewCard from "../../../components/knowledge-base/KnowledgeBaseNewCard";
import KnowledgeBaseTree from "../../../components/knowledge-base/KnowledgeBaseTree";
import Layout from "../../../components/Layout";
import withAuth from "../../../hocs/withAuth";

const KnowledgeBase = () => {
  return (
    <Layout title="Base de connaissances">
      <h1 className="px-8 py-3 font-bold text-lg">Base de connaissances</h1>
      <div className="flex h-full w-full  border-t-2">
        <div class="container my-12 mx-auto px-4 md:px-12 overflow-auto">
          <div class="flex flex-wrap -mx-1 lg:-mx-4">
            {Array.from("al").map((i) => (
              <KnowledgeBaseCard />
            ))}
          </div>
        </div>
        {/*  <div class="flex flex-wrap -mx-1 lg:-mx-4">
          <KnowledgeBaseCard title="Comment me connecter ?" roles={["referent", "young"]} />
          <KnowledgeBaseNewCard />
        </div> */}
        <KnowledgeBaseTree />
      </div>
    </Layout>
  );
};

export default withAuth(KnowledgeBase);
