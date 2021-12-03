import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import KnowledgeBaseArticle from "../../../components/knowledge-base/KnowledgeBaseArticle";
import KnowledgeBaseBreadcrumb from "../../../components/knowledge-base/KnowledgeBaseBreadcrumb";
import KnowledgeBaseCreate from "../../../components/knowledge-base/KnowledgeBaseCreate";
import KnowledgeBaseItemMetadata from "../../../components/knowledge-base/KnowledgeBaseItemMetadata";
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

  const [metadataVisible, setMetadataVisible] = useState(!localStorage.getItem("snu-support-kb-meta-hidden"));
  useEffect(() => {
    if (!treeVisible) {
      localStorage.setItem("snu-support-kb-meta-hidden", "true");
    } else {
      localStorage.removeItem("snu-support-kb-meta-hidden");
    }
  }, [metadataVisible]);

  const router = useRouter();

  const [slug, setSlug] = useState(router.query?.slug || "");
  useEffect(() => {
    setSlug(router.query?.slug || "");
  }, [router.query?.slug]);

  const { item } = useKnowledgeBaseData({ debug: true });

  const isRoot = router.pathname === "/admin/knowledge-base";

  return (
    <Layout title="Base de connaissances" className="flex flex-col">
      <Header>
        Base de connaissances
        <KnowledgeBaseBreadcrumb parents={item?.parents} />
        <div id="breadcrumb" className="px-4 py-2 -ml-12 -mr-12 -mb-3 flex justify-between items-baseline flex-shrink-0 w-screen bg-snu-purple-900">
          <button onClick={() => setTreeVisible((v) => !v)} className="bg-transparent border-none hover:underline text-xs font-light p-0 m-0">
            {treeVisible ? "Masquer" : "Afficher"} l'arbre
          </button>
          {!isRoot && (
            <button onClick={() => setMetadataVisible((v) => !v)} className="bg-transparent border-none hover:underline text-xs font-light p-0 m-0">
              {metadataVisible ? "Masquer les infos" : "Afficher les infos"}
            </button>
          )}
        </div>
      </Header>
      {(!isRoot && !slug) || !item ? (
        <Loader />
      ) : (
        <div className="relative bg-coolGray-200 flex border-t-2 h-full w-full flex-grow flex-shrink overflow-hidden">
          <KnowledgeBaseTree visible={treeVisible} setVisible={setTreeVisible} />
          <Content key={slug} item={item} />
          {!isRoot && (
            <>
              <KnowledgeBaseItemMetadata visible={metadataVisible} />
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

const Content = ({ item }) => {
  if (!item) return null;
  if (["root", "section"].includes(item?.type)) return <KnowledgeBaseSection key={item._id} section={item} isRoot={item?.type === "root"} />;
  if (item?.type === "article") return <KnowledgeBaseArticle article={item} />;
  // return article
  return <KnowledgeBaseCreate position={0} />;
};

const TreeButton = ({ visible, setVisible }) =>
  visible ? null : (
    <svg
      onClick={() => setVisible(true)}
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 cursor-pointer absolute left-2 top-2 z-10"
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

const MoreButton = ({ visible, setVisible }) =>
  visible ? null : (
    <svg onClick={() => setVisible(true)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" className="h-8 w-8 cursor-pointer absolute right-2 top-2 z-10">
      <title>music, sound, volume, More</title>
      <g data-name="Layer 15">
        <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28ZM12,16a2,2,0,1,1-2-2A2,2,0,0,1,12,16Zm6,0a2,2,0,1,1-2-2A2,2,0,0,1,18,16Zm6,0a2,2,0,1,1-2-2A2,2,0,0,1,24,16Z" />
      </g>
      <text x="0" y="47" fill="#000000" fontSize="5px" fontWeight="bold" fontFamily="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">
        Created by Caesar Rizky Kurniawan
      </text>
      <text x="0" y="52" fill="#000000" fontSize="5px" fontWeight="bold" fontFamily="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">
        from the Noun Project
      </text>
    </svg>
  );

export default withAuth(KnowledgeBase);
