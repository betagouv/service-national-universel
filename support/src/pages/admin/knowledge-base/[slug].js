import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/Header";
import AdminKBArticle from "../../../components/knowledge-base/AdminKBArticle";
import AdminKBBreadcrumb from "../../../components/knowledge-base/AdminKBBreadcrumb";
import AdminKBCreate from "../../../components/knowledge-base/AdminKBCreate";
import AdminKBItemMetadata from "../../../components/knowledge-base/AdminKBItemMetadata";
import AdminKBSection from "../../../components/knowledge-base/AdminKBSection";
import AdminKBTree from "../../../components/knowledge-base/AdminKBTree";
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
    if (!metadataVisible) {
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

  const isLoading = useMemo(() => {
    if (!isRoot && !slug) return true;
    if (!isRoot && item.type === "root") return true;
    if (!item) return true;
    return false;
  }, [isRoot, slug, item]);

  return (
    <Layout title="Base de connaissances" className="flex flex-col">
      <Header>
        Base de connaissances
        <AdminKBBreadcrumb parents={item?.parents} />
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
      {isLoading ? (
        <Loader />
      ) : (
        <div className="relative bg-coolGray-200 flex border-t-2 h-full w-full flex-grow flex-shrink overflow-hidden">
          <aside className={`relative flex flex-col flex-grow-0 flex-shrink-0 border-r-2 shadow-lg z-10 resize-x p-2 overflow-hidden ${treeVisible ? "w-80" : "w-0 hidden"}`}>
            <AdminKBTree isSortable onClick={(slug) => router.push(`/admin/knowledge-base/${slug || ""}`)} />
          </aside>
          <Content key={slug} item={item} />
          {!isRoot && (
            <>
              <AdminKBItemMetadata key={item?._id} visible={metadataVisible} />
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

const Content = ({ item }) => {
  if (!item) return null;
  if (["root", "section"].includes(item?.type)) return <AdminKBSection key={item._id} section={item} isRoot={item?.type === "root"} />;
  if (item?.type === "article") return <AdminKBArticle article={item} />;
  // return article
  return <AdminKBCreate position={0} />;
};

export default withAuth(KnowledgeBase);
