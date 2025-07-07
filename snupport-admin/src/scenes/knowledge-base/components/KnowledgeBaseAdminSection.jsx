import React, { useContext, useEffect, useRef, useState } from "react";
import SortableJS from "sortablejs";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import API from "../../../services/api";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCard";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import KnowledgeBaseAdminItemCreate from "./KnowledgeBaseAdminItemCreate";
import Tags from "./Tags";
import Loader from "./../../../components/Loader";
import Modal from "./Modal";
import KnowledgeBasePublicContent from "./KnowledgeBasePublicContent";
import KnowledgeBasePublicHome from "./KnowledgeBasePublicHome";
import KnowledgeBaseContext from "./../contexts/knowledgeBase";
import { Popover } from "@headlessui/react";
import SeeAsContext from "./../contexts/seeAs";
import { Button } from "./Buttons";
import { translateRoleBDC } from "../../../utils";
import { contentSummary, contentSummaryArticle } from "./../utils/knowledgeBaseTree";

const KnowledgeBaseAdminSection = ({ section, isRoot }) => {
  const organisation = useSelector((state) => state.Auth.organisation);
  const { refreshKB } = useContext(KnowledgeBaseContext);
  const { seeAs, setSeeAs } = useContext(SeeAsContext);
  const gridSectionsRef = useRef(null);
  const gridAnswersRef = useRef(null);
  const sortableSections = useRef(null);
  const sortableAnswers = useRef(null);

  const [readOnly, setReadOnly] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const onListChange = async (list) => {
    setIsSaving(true);
    const gridRef = list === "sections" ? gridSectionsRef : gridAnswersRef;
    const newSort = [...gridRef.current.children]
      .map((i) => i.dataset.id)
      .map((id) => section.children.find((item) => item._id === id))
      .map((sortedItem, index) => ({ ...sortedItem, position: index + 1 }));

    const response = await API.put({
      path: "/knowledge-base/reorder",
      body: newSort.map(({ _id, position, title }) => ({ _id, position, title, parentId: section._id })),
    });
    if (!response.ok) {
      setIsSaving(false);
      toast.error("Désolé, une erreur est survenue. Veuillez recommencer !");
      return;
    }
    refreshKB();
    setIsSaving(false);
  };

  const hasSectionChild = (section) => {
    if (section.children.some((child) => child.type === "section") || section.parentId === null) {
      return true;
    } else {
      return false;
    }
  };
  const sections = section.children.filter((c) => c.type === "section");
  const articles = section.children.filter((c) => c.type === "article");

  const isWhat = (isRoot, section) => {
    if (isRoot) {
      return "la page d'accueil";
    } else if (hasSectionChild(section)) {
      return "la thématique";
    } else {
      return "la sous-thématique";
    }
  };

  useEffect(() => {
    sortableSections.current = new SortableJS(gridSectionsRef.current, { animation: 150, group: "sections", onEnd: () => onListChange("sections") });
    sortableAnswers.current = new SortableJS(gridAnswersRef.current, { animation: 150, group: "articles", onEnd: () => onListChange("articles") });
  }, []);

  return (
    <article className="container relative mx-auto flex h-full w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100">
      <header className="flex w-full justify-between border-2 px-12 flex-wrap py-3">
        <h2 className="text-lg font-bold">
          {isRoot ? "Page d'Accueil" : section.title}
          {!!section.description?.length && <p className="mt-1 text-sm italic">{section.description}</p>}
          {!!section.allowedRoles?.length && (
            <p className="mt-3.5 flex flex-wrap text-sm font-normal">
              Visible par: <Tags tags={section.allowedRoles} />
            </p>
          )}
        </h2>
        <Popover className="my-auto">
          <Popover.Button className="relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-[#5145cc] bg-[#5145cc] px-12 py-2 text-base font-bold text-white opacity-100 drop-shadow-md">
            Prévisualiser {isWhat(isRoot, section)}
          </Popover.Button>
          <Popover.Panel className="absolute right-0 top-10 z-10 min-w-[208px] lg:min-w-0">
            <div className="flex flex-col gap-4 rounded-md border border-gray-300 bg-white px-4 py-3">
              {organisation.knowledgeBaseRoles.map((role) => (
                <a
                  key={role}
                  onClick={() => {
                    setReadOnly((r) => !r);
                    setSeeAs(role);
                  }}
                  className={`text-sm font-${seeAs === role ? "bold" : "medium"} cursor-pointer text-gray-700`}
                >
                  Voir en tant que {translateRoleBDC[role]}
                </a>
              ))}
            </div>
          </Popover.Panel>
        </Popover>
      </header>
      <main className={`flex h-full flex-col w-full max-w-screen-2xl flex-shrink overflow-y-auto`}>
        <section className={`flex flex-col ${hasSectionChild(section) ? "w-full pt-6 px-12" : "hidden"} shrink-0 flex-grow-[2]`}>
          {!isRoot && hasSectionChild(section) && <p className="mb-2 text-coolGray-500">{contentSummary(sections, isRoot)}</p>}
          <div className="flex flex-row flex-wrap mb-6 gap-6">
            {hasSectionChild(section) && (
              <div className="flex-1 min-w-[250px]">
                <div className="flex flex-grow flex-col rounded-lg bg-white shadow-lg">
                  <div className="flex items-center justify-start bg-white rounded-lg py-2 px-4">
                    <KnowledgeBaseAdminItemCreate position={section.children.length + 1} parentId={section._id} type="section" />
                    <p className="ml-2 text-[14px] text-[#2563EB]">Créer une {isRoot ? "thématique" : "sous-thématique"}</p>
                  </div>
                </div>
              </div>
            )}
            {isRoot && (
              <div className="flex-1 min-w-[250px]">
                <div className="flex flex-grow rounded-lg bg-white shadow-lg">
                  <div className="flex items-center justify-start bg-white rounded-lg py-2 px-4">
                    <KnowledgeBaseAdminItemCreate position={section.children.length + 1} parentId={section._id} type="article" isRoot={isRoot} />
                    <p className="ml-2 text-[14px] text-[#2563EB]">Créer un article</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {isRoot && <p className="text-coolGray-500">{contentSummary(sections, isRoot)}</p>}
          <div ref={gridSectionsRef} id="sections" className={`flex w-full flex-shrink justify-center flex-wrap overflow-y-auto px-12`}>
            {sections.map((section) => (
              <React.Fragment key={section._id}>
                <KnowledgeBaseSectionCard
                  _id={section._id}
                  position={section.position}
                  imageSrc={section.imageSrc}
                  icon={section.icon}
                  title={section.title}
                  group={section.group}
                  createdAt={section.createdAt}
                  slug={section.slug}
                  allowedRoles={section.allowedRoles}
                  sectionChildren={section.children}
                  isRoot={isRoot}
                />
                {!!isRoot && <div className="mr-4" />}
              </React.Fragment>
            ))}
            {/* {!sections.length && <span className="block w-full p-10 text-gray-400">Pas de rubrique</span>} */}
          </div>
        </section>
        <section className={`flex flex-col shrink-0 flex-grow-[4] border-r-2 px-12 pt-6 ${isRoot ? "hidden" : ""}`}>
          {!isRoot && hasSectionChild(section) && <p className="mb-2 text-coolGray-500 self-start">{contentSummaryArticle(section.children)}</p>}
          {!isRoot && (
            <div className="flex-1 min-w-[250px] mb-6">
              <article className="flex flex-grow flex-col rounded-lg bg-white shadow-lg">
                <div className="flex items-center justify-start bg-white rounded-lg py-2 px-4">
                  <KnowledgeBaseAdminItemCreate position={section.children.length + 1} parentId={section._id} type="article" />
                  <p className="ml-2 text-[14px] text-[#2563EB]">Créer un article</p>
                </div>
              </article>
            </div>
          )}
          {!isRoot && !hasSectionChild(section) && <p className="mb-2 text-coolGray-500 self-start">{contentSummaryArticle(section.children)}</p>}
          <div ref={gridAnswersRef} id="articles" className="flex h-full w-full flex-shrink flex-col overflow-y-auto">
            {articles.map((article) => (
              <KnowledgeBaseArticleCard
                key={article._id}
                _id={article._id}
                position={article.position}
                title={article.title}
                slug={article.slug}
                allowedRoles={article.allowedRoles}
              />
            ))}
            {!articles.length && <span className="block w-full self-center py-10 text-gray-400">Pas d'article</span>}
          </div>
        </section>
        {!!isSaving && (
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-gray-500 opacity-25">
            <Loader color="#bbbbbb" size={100} />
          </div>
        )}
      </main>
      <Modal
        fullScreen
        isOpen={readOnly}
        onRequestClose={() => setReadOnly(false)}
        closeButton={
          <Button
            type="button"
            className="!fixed top-0 h-16 w-full rounded-none"
            onClick={() => {
              setReadOnly((r) => !r);
              setSeeAs(null);
            }}
          >
            Retour à l'édition
          </Button>
        }
        className="pt-16"
      >
        {section.type === "root" ? (
          <KnowledgeBasePublicHome
            item={{ ...section, children: section.children.filter((c) => c.status === "PUBLISHED").filter((s) => !seeAs || s.allowedRoles.includes(seeAs)) }}
          />
        ) : (
          <KnowledgeBasePublicContent
            item={{ ...section, children: section.children.filter((c) => c.status === "PUBLISHED").filter((s) => !seeAs || s.allowedRoles.includes(seeAs)) }}
          />
        )}
      </Modal>
    </article>
  );
};

export default KnowledgeBaseAdminSection;
