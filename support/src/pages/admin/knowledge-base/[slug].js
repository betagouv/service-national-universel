import { useRouter } from "next/router";
import useSWR from "swr";
import KnowledgeBaseCreate from "../../../components/knowledge-base/KnowledgeBaseCreate";
import KnowledgeBaseSection from "../../../components/knowledge-base/KnowledgeBaseSection";
import KnowledgeBaseTree from "../../../components/knowledge-base/KnowledgeBaseTree";
import Layout from "../../../components/Layout";
import withAuth from "../../../hocs/withAuth";
import API from "../../../services/api";

const KnowledgeBase = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base${!!slug ? `/${slug}` : ""}`, query: { withTree: true } }));

  console.log(response);

  const renderBody = () => {
    if (!response?.data) return null;
    if (response.data.type === "root") return <KnowledgeBaseSection key={slug} section={response.data} isRoot />;
    if (response.data.type === "section") return <KnowledgeBaseSection key={slug} section={response.data} />;
    if (response.data.type === "answer") return null;
    // return answer
    return <KnowledgeBaseCreate position={0} />;
  };

  return (
    <Layout title="Base de connaissances">
      <h1 className="px-8 py-3 font-bold text-lg">Base de connaissances</h1>
      <div className="flex h-full w-full flex-grow border-t-2">
        <div className="container my-12 mx-auto px-4 md:px-12 overflow-auto">{renderBody()}</div>
        <KnowledgeBaseTree />
      </div>
    </Layout>
  );
};

export default withAuth(KnowledgeBase);
