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

  const renderBody = () => {
    if (!response?.data) return null;
    if (response.data.type === "root") return <KnowledgeBaseSection key={slug} section={response.data} isRoot />;
    if (response.data.type === "section") return <KnowledgeBaseSection key={slug} section={response.data} />;
    if (response.data.type === "answer") return null;
    // return answer
    return <KnowledgeBaseCreate position={0} />;
  };

  return (
    <Layout title="Base de connaissances" className="flex flex-col">
      <h1 className="px-8 py-3 font-bold text-lg">Base de connaissances</h1>
      <div className="flex border-t-2 h-full w-full flex-grow flex-shrink overflow-hidden">
        <div className="container relative h-full box-border flex flex-col">{renderBody()}</div>
        <KnowledgeBaseTree />
      </div>
    </Layout>
  );
};

export default withAuth(KnowledgeBase);
