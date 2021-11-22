import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import KnowledgeBaseBreadcrumb from "../../../components/knowledge-base/KnowledgeBaseBreadcrumb";
import KnowledgeBaseCreate from "../../../components/knowledge-base/KnowledgeBaseCreate";
import KnowledgeBaseSection from "../../../components/knowledge-base/KnowledgeBaseSection";
import KnowledgeBaseTree from "../../../components/knowledge-base/KnowledgeBaseTree";
import Layout from "../../../components/Layout";
import withAuth from "../../../hocs/withAuth";
import API from "../../../services/api";

const KnowledgeBase = () => {
  const router = useRouter();

  const [slug, setSlug] = useState(router.query?.slug || "");
  useEffect(() => {
    setSlug(router.query?.slug || "");
  }, [router.query?.slug]);

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${slug}`, query: { withTree: true, withParents: true } }));
  const [data, setData] = useState(response?.data || []);
  useEffect(() => {
    setData(response?.data || []);
  }, [response?.data]);

  return (
    <Layout title="Base de connaissances" className="flex flex-col">
      <h1 className="px-8 py-3 font-bold text-lg">Base de connaissances</h1>
      <div className="flex border-t-2 h-full w-full flex-grow flex-shrink overflow-hidden">
        <div className="container relative h-full box-border flex flex-col">
          <KnowledgeBaseBreadcrumb parents={data?.parents} />
          <Content key={slug} data={data} />
        </div>
        <KnowledgeBaseTree />
      </div>
    </Layout>
  );
};

const Content = ({ data }) => {
  if (!data) return null;
  if (["root", "section"].includes(data?.type)) return <KnowledgeBaseSection section={data} isRoot={data?.type === "root"} />;
  if (data?.type === "answer") return null;
  // return answer
  return <KnowledgeBaseCreate position={0} />;
};

export default withAuth(KnowledgeBase);
