import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import KnowledgeBaseAnswer from "../../../components/knowledge-base/KnowledgeBaseAnswer";
import KnowledgeBaseBreadcrumb from "../../../components/knowledge-base/KnowledgeBaseBreadcrumb";
import KnowledgeBaseCreate from "../../../components/knowledge-base/KnowledgeBaseCreate";
import KnowledgeBaseSection from "../../../components/knowledge-base/KnowledgeBaseSection";
import KnowledgeBaseTree from "../../../components/knowledge-base/KnowledgeBaseTree";
import Layout from "../../../components/Layout";
import Loader from "../../../components/Loader";
import withAuth from "../../../hocs/withAuth";
import useKnowledgeBaseData from "../../../hooks/useKnowledgeBaseData";

const KnowledgeBase = () => {
  const [treeVisible, setTreeVisible] = useState(!localStorage.getItem("snu-support-kb-tree-hidden"));
  useEffect(() => {
    if (!treeVisible) {
      localStorage.setItem("snu-support-kb-tree-hidden", "true");
    } else {
      localStorage.removeItem("snu-support-kb-tree-hidden");
    }
  }, [treeVisible]);

  const router = useRouter();

  const [slug, setSlug] = useState(router.query?.slug || "");
  useEffect(() => {
    setSlug(router.query?.slug || "");
  }, [router.query?.slug]);

  const { item: data } = useKnowledgeBaseData(slug);

  console.log({ data, slug });

  const isRoot = router.pathname === "/admin/knowledge-base";

  return (
    <Layout title="Base de connaissances" className="flex flex-col">
      <Header>Base de connaissances</Header>
      <KnowledgeBaseBreadcrumb parents={data?.parents} />
      {(!isRoot && !slug) || !data ? (
        <Loader />
      ) : (
        <div className="relative flex border-t-2 h-full w-full flex-grow flex-shrink overflow-hidden">
          <div className="flex-grow relative h-full box-border flex flex-col items-center">
            <Content key={slug} data={data} />
          </div>
          <TreeButton visible={treeVisible} setVisible={setTreeVisible} />
          <KnowledgeBaseTree visible={treeVisible} setVisible={setTreeVisible} />
        </div>
      )}
    </Layout>
  );
};

const Content = ({ data }) => {
  if (!data) return null;
  if (["root", "section"].includes(data?.type)) return <KnowledgeBaseSection key={data._id} section={data} isRoot={data?.type === "root"} />;
  if (data?.type === "article") return <KnowledgeBaseAnswer article={data} />;
  // return article
  return <KnowledgeBaseCreate position={0} />;
};

const TreeButton = ({ visible, setVisible }) =>
  visible ? null : (
    <svg
      onClick={() => setVisible(true)}
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 cursor-pointer absolute right-2 top-2"
      viewBox="0 0 100 125"
      fill="currentColor"
      stroke="currentColor"
    >
      <title>Category3</title>
      <path d="M36,28.5H21a4,4,0,0,1-4-4V9.5a4,4,0,0,1,4-4H36a4,4,0,0,1,4,4v15A4,4,0,0,1,36,28.5ZM21,8.5a1,1,0,0,0-1,1v15a1,1,0,0,0,1,1H36a1,1,0,0,0,1-1V9.5a1,1,0,0,0-1-1Z" />
      <path d="M79,58.5H64a4,4,0,0,1-4-4v-15a4,4,0,0,1,4-4H79a4,4,0,0,1,4,4v15A4,4,0,0,1,79,58.5Zm-15-20a1,1,0,0,0-1,1v15a1,1,0,0,0,1,1H79a1,1,0,0,0,1-1v-15a1,1,0,0,0-1-1Z" />
      <path d="M79,94.5H64a4,4,0,0,1-4-4v-15a4,4,0,0,1,4-4H79a4,4,0,0,1,4,4v15A4,4,0,0,1,79,94.5Zm-15-20a1,1,0,0,0-1,1v15a1,1,0,0,0,1,1H79a1,1,0,0,0,1-1v-15a1,1,0,0,0-1-1Z" />
      <polygon points="61.5 86 25.5 86 25.5 27 31.5 27 31.5 80 61.5 80 61.5 86" />
      <rect x="28.5" y="44" width="33" height="6" />
    </svg>
  );

export default withAuth(KnowledgeBase);
