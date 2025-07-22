import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
import KnowledgeBaseAdminArticle from "./components/KnowledgeBaseAdminArticle";
import KnowledgeBaseAdminBreadcrumb from "./components/KnowledgeBaseAdminBreadcrumb";
import KnowledgeBaseAdminItemCreate from "./components/KnowledgeBaseAdminItemCreate";
import KnowledgeBaseAdminItemMetadata from "./components/KnowledgeBaseAdminItemMetadata";
import KnowledgeBaseAdminSection from "./components/KnowledgeBaseAdminSection";
import KnowledgeBaseAdminTree from "./components/KnowledgeBaseAdminTree";
import KnowledgeBaseTopBar from "./components/KnowledgeBaseTopBar";
import Loader from "../../components/Loader";
import ResizablePanel from "./components/ResizablePanel";
import KnowledgeBaseContext, { KnowledgeBaseProvider } from "./contexts/knowledgeBase";
import { SeeAsProvider } from "./contexts/seeAs";
import { buildItemTree } from "./utils/knowledgeBaseTree";
import { translateRoleBDC } from "../../utils";

const KnowledgeBase = () => {
  const organisation = useSelector((state) => state.Auth.organisation);
  const { flattenedKB, knowledgeBaseTree, refreshKB } = useContext(KnowledgeBaseContext);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [treeVisible, setTreeVisible] = useState(!window.localStorage.getItem("snu-support-kb-tree-hidden"));
  useEffect(() => {
    if (!treeVisible) {
      window.localStorage.setItem("snu-support-kb-tree-hidden", "true");
    } else {
      window.localStorage.removeItem("snu-support-kb-tree-hidden");
    }
  }, [treeVisible]);

  const [metadataVisible, setMetadataVisible] = useState(!window.localStorage.getItem("snu-support-kb-meta-hidden"));
  useEffect(() => {
    if (!metadataVisible) {
      window.localStorage.setItem("snu-support-kb-meta-hidden", "true");
    } else {
      window.localStorage.removeItem("snu-support-kb-meta-hidden");
    }
  }, [metadataVisible]);

  const params = useParams();
  const location = useLocation();
  const history = useHistory();

  const slug = params.slug;
  const item = useMemo(() => {
    if (!flattenedKB?.length) return knowledgeBaseTree;
    if (!slug?.length) return knowledgeBaseTree;
    const itemTree = buildItemTree(slug, flattenedKB, knowledgeBaseTree);
    if (!itemTree) {
      history.push("/knowledge-base");
      return knowledgeBaseTree;
    }
    return itemTree;
  }, [slug, flattenedKB, knowledgeBaseTree]);

  const isRoot = location.pathname === "/knowledge-base" || location.pathname === "/knowledge-base/";

  const isLoading = useMemo(() => {
    if (!flattenedKB.length) return true;
    if (!isRoot && !slug) return true;
    if (!item) return true;
    if (!isRoot && item?.type === "root") return true;
    return false;
  }, [isRoot, slug, item]);

  useEffect(() => {
    if (item?.title) document.title = `${item.title} | Outil support`;
  }, [item?.title]);

  return (
    <div id="knowledge-base" className="content relative flex h-full w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100 transition-transform">
      <KnowledgeBaseTopBar />
      <header className="flex flex-col items-start bg-snu-purple-900 py-2 pl-12 pr-8 text-lg font-bold text-white">
        <div className="mb-2 flex w-full items-baseline justify-between">
          <span className="-ml-8">Base de connaissance</span>
          <a
            href={`${organisation.knowledgeBaseBaseUrl}/${params?.slug}`}
            className="m-0 ml-auto border-none bg-transparent p-0 text-xs font-light text-white hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Aller à la base de connaissance publique
          </a>
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
      </header>
      {!item ? (
        <Loader />
      ) : (
        <div className="max-w-[calc(100vw - 52px)] m-w-full relative flex h-full w-full flex-shrink flex-grow overflow-hidden border-t-2 bg-coolGray-200">
          <ResizablePanel className={`relative z-10 flex shrink-0 grow-0  ${treeVisible ? "w-80" : "hidden w-0"}`} name="admin-knowledge-base-tree" position="left">
            <div className="relative flex flex-col overflow-hidden pr-2">
              <div className=" ml-2 grid grid-cols-2">
                {organisation?.knowledgeBaseRoles.map((role) => {
                  return (
                    <div className="flex items-center" key={role}>
                      <input
                        className="mr-4"
                        id={`allowedRoles.${role}`}
                        type="checkbox"
                        name={`allowedRoles.${role}`}
                        onClick={() => {
                          const selRoles = selectedRoles.includes(role) ? selectedRoles.filter((r) => r !== role) : [...selectedRoles, role];
                          setSelectedRoles(selRoles);
                          refreshKB(selRoles);
                        }}
                      />
                      <label className={`mr-2 overflow-hidden whitespace-nowrap`} id={role} htmlFor={`allowedRoles.${role}`}>
                        {translateRoleBDC[role]}
                      </label>
                    </div>
                  );
                })}
              </div>
              <KnowledgeBaseAdminTree isSortable onClick={(slug) => history.push(`/knowledge-base/${slug || ""}`)} />
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
    </div>
  );
};

const Content = ({ item }) => {
  if (!item) return null;
  if (["root", "section"].includes(item?.type)) return <KnowledgeBaseAdminSection key={item._id} section={item} isRoot={item?.type === "root"} />;
  if (item?.type === "article") return <KnowledgeBaseAdminArticle article={item} />;

  return <KnowledgeBaseAdminItemCreate position={0} />;
};

export default () => (
  <KnowledgeBaseProvider>
    <SeeAsProvider>
      <KnowledgeBase />
    </SeeAsProvider>
  </KnowledgeBaseProvider>
);
