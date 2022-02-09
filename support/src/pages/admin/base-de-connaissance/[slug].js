import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/Header";
import KnowledgeBaseAdminArticle from "../../../components/knowledge-base/KnowledgeBaseAdminArticle";
import KnowledgeBaseAdminBreadcrumb from "../../../components/knowledge-base/KnowledgeBaseAdminBreadcrumb";
import KnowledgeBaseAdminItemCreate from "../../../components/knowledge-base/KnowledgeBaseAdminItemCreate";
import KnowledgeBaseAdminItemMetadata from "../../../components/knowledge-base/KnowledgeBaseAdminItemMetadata";
import KnowledgeBaseAdminSection from "../../../components/knowledge-base/KnowledgeBaseAdminSection";
import KnowledgeBaseAdminTree from "../../../components/knowledge-base/KnowledgeBaseAdminTree";
import Layout from "../../../components/Layout";
import Loader from "../../../components/Loader";
import ResizablePanel from "../../../components/ResizablePanel";
import withAuth from "../../../hocs/withAuth";
import useKnowledgeBaseData from "../../../hooks/useKnowledgeBaseData";
import Head from "next/head";

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

  const isRoot = router.pathname === "/admin/base-de-connaissance";

  const isLoading = useMemo(() => {
    if (!isRoot && !slug) return true;
    if (!isRoot && item.type === "root") return true;
    if (!item) return true;
    return false;
  }, [isRoot, slug, item]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#32257F" />
        <meta name="description" content="Service National Universel | Base de connaissance" />
        <meta property="og:title" key="og:title" content="Service National Universel | Base de connaissance" />
        <meta property="og:url" key="og:url" content="https://support.snu.gouv.fr/base-de-connaissance/" />
        <meta rel="canonical" key="canonical" content="https://support.snu.gouv.fr/base-de-connaissance/" />
        <meta property="og:description" content="Service National Universel | Base de connaissance" />

        <meta property="og:image" key="og:image" content="https://support.snu.gouv.fr/assets/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" key="og:image:alt" content="Service National Universel | Base de connaissance" />
        <meta property="og:type" content="article" />
      </Head>
      <Layout title="Base de connaissance" className="flex flex-col">
        <Header>
          <div className="mb-2 flex w-full items-baseline justify-between">
            <span className="-ml-8">Base de connaissance</span>
            <Link href={`/base-de-connaissance/${router?.query?.slug}`}>
              <a className="m-0 ml-auto border-none bg-transparent p-0 text-xs font-light hover:underline" href="#">
                Aller à la base de connaissance publique
              </a>
            </Link>
          </div>
          <KnowledgeBaseAdminBreadcrumb parents={item?.parents} />
          <div id="breadcrumb" className="-ml-8 -mr-8 -mb-3 flex w-full shrink-0 items-baseline justify-between bg-snu-purple-900 py-2">
            <button onClick={() => setTreeVisible((v) => !v)} className="m-0 border-none bg-transparent p-0 text-xs font-light hover:underline">
              {treeVisible ? "Masquer" : "Afficher"} l'arbre
            </button>
            {!isRoot && (
              <button onClick={() => setMetadataVisible((v) => !v)} className="m-0 ml-auto -mr-8 border-none bg-transparent p-0 text-xs font-light hover:underline">
                {metadataVisible ? "Masquer les infos" : "Afficher les infos"}
              </button>
            )}
          </div>
        </Header>
        {!item ? (
          <Loader />
        ) : (
          <div className="max-w-[calc(100vw - 52px)] m-w-full relative flex h-full w-full flex-shrink flex-grow overflow-hidden border-t-2 bg-coolGray-200">
            <ResizablePanel className={`relative z-10 flex shrink-0 grow-0  ${treeVisible ? "w-80" : "hidden w-0"}`} name="admin-knowledge-base-tree" position="left">
              <div className="relative flex flex-col overflow-hidden pr-2">
                <KnowledgeBaseAdminTree isSortable onClick={(slug) => router.push(`/admin/base-de-connaissance/${slug || ""}`)} />
              </div>
            </ResizablePanel>
            {isLoading ? <Loader /> : <Content key={slug} item={item} />}
            {!isRoot && (
              <>
                <KnowledgeBaseAdminItemMetadata key={item?._id} visible={metadataVisible} />
              </>
            )}
          </div>
        )}
      </Layout>
    </>
  );
};

const Content = ({ item }) => {
  if (!item) return null;
  if (["root", "section"].includes(item?.type)) return <KnowledgeBaseAdminSection key={item._id} section={item} isRoot={item?.type === "root"} />;
  if (item?.type === "article") return <KnowledgeBaseAdminArticle article={item} />;
  // return article
  return <KnowledgeBaseAdminItemCreate position={0} />;
};

export default withAuth(KnowledgeBase);
