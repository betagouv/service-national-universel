import React, { useContext, useEffect, useRef, useState } from "react";
import SortableJS from "sortablejs";
import { toast } from "react-toastify";
import withAuth from "../hocs/withAuth";
import API from "../services/api";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCard";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import KnowledgeBaseAdminItemCreate from "./KnowledgeBaseAdminItemCreate";
import Tags from "./Tags";
import useKnowledgeBaseData from "../hooks/useKnowledgeBaseData";
import Loader from "./Loader";
import Modal from "./Modal";
import KnowledgeBasePublicContent from "./KnowledgeBasePublicContent";
import KnowledgeBasePublicHome from "./KnowledgeBasePublicHome";
import SeeAsContext from "../hooks/useSeeAs";
import { SUPPORT_ROLES } from "snu-lib/roles";
import { Popover } from "@headlessui/react";

const KnowledgeBaseAdminSection = ({ section, isRoot }) => {
  const { setSeeAs, seeAs } = useContext(SeeAsContext);
  const { mutate } = useKnowledgeBaseData();
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
      path: "/support-center/knowledge-base/reorder",
      body: newSort.map(({ _id, position, title }) => ({ _id, position, title, parentId: section._id })),
    });
    if (!response.ok) {
      setIsSaving(false);
      toast.error("Désolé, une erreur est survenue. Veuillez recommencer !");
      return;
    }
    mutate();
    setIsSaving(false);
  };

  const sections = section.children.filter((c) => c.type === "section");
  const articles = section.children.filter((c) => c.type === "article");

  useEffect(() => {
    sortableSections.current = new SortableJS(gridSectionsRef.current, { animation: 150, group: "sections", onEnd: () => onListChange("sections") });
    sortableAnswers.current = new SortableJS(gridAnswersRef.current, { animation: 150, group: "articles", onEnd: () => onListChange("articles") });
  }, []);

  return (
    <article className="container bg-coolGray-100 mx-auto flex flex-col flex-grow h-full relative w-full flex-shrink overflow-hidden">
      <header className="px-8 py-3 flex justify-between w-full border-2">
        <h2 className="font-bold text-lg">
          {isRoot ? "Home" : section.title}
          {!!section.description?.length && <p className="mt-1 text-sm italic">{section.description}</p>}
          {!!section.allowedRoles?.length && (
            <p className="font-normal flex flex-wrap mt-3.5 text-sm">
              Visible par: <Tags tags={section.allowedRoles} />
            </p>
          )}
        </h2>
        <Popover className="my-auto">
          <Popover.Button>Prévisualiser</Popover.Button>
          <Popover.Panel className="absolute right-0 min-w-[208px] lg:min-w-0 z-10 top-10">
            <div className="flex flex-col gap-4 px-4 py-3 bg-white border border-gray-300 rounded-md">
              {Object.keys(SUPPORT_ROLES).map((role) => (
                <a
                  key={role}
                  onClick={() => {
                    setReadOnly((r) => !r);
                    setSeeAs(role);
                  }}
                  className={`text-sm font-${seeAs === role ? "bold" : "medium"} text-gray-700 cursor-pointer`}
                >
                  Voir en tant que {SUPPORT_ROLES[role]}
                </a>
              ))}
            </div>
          </Popover.Panel>
        </Popover>
      </header>
      <main className={`flex h-full ${isRoot ? "flex-col" : ""} w-full max-w-screen-2xl flex-shrink overflow-y-auto`}>
        <section className={`flex flex-col  ${isRoot ? "w-full order-2" : ""} flex-grow-[4] flex-shrink-0 border-r-2 pt-6 px-12`}>
          <h3 className="px-10 flex items-center font-bold uppercase text-sm text-snu-purple-900">
            Sujets
            <KnowledgeBaseAdminItemCreate position={section.children.length + 1} parentId={section._id} type="article" />
          </h3>
          <div ref={gridAnswersRef} id="articles" className="flex flex-col h-full w-full flex-shrink overflow-y-auto">
            {articles.map((article) => (
              <KnowledgeBaseArticleCard
                key={article._id}
                _id={article._id}
                position={article.position}
                title={article.title}
                slug={article.slug}
                allowedRoles={article.allowedRoles}
                path="/admin/base-de-connaissance"
              />
            ))}
            {!articles.length && <span className="self-center w-full py-10 text-gray-400 block">Pas d'article</span>}
          </div>
        </section>
        <section className={`flex flex-col ${isRoot ? "w-full" : ""} flex-grow-[2] flex-shrink-0  pt-6`}>
          <h3 className="px-10 flex items-center font-bold uppercase text-sm text-snu-purple-900">
            Catégories
            <KnowledgeBaseAdminItemCreate position={section.children.length + 1} parentId={section._id} type="section" />
          </h3>
          <div ref={gridSectionsRef} id="sections" className={`flex ${isRoot ? "justify-center" : ""} flex-wrap w-full flex-shrink overflow-y-auto px-12`}>
            {sections.map((section) => (
              <React.Fragment key={section._id}>
                <KnowledgeBaseSectionCard
                  _id={section._id}
                  path="/admin/base-de-connaissance"
                  position={section.position}
                  imageSrc={section.imageSrc}
                  icon={section.icon}
                  title={section.title}
                  group={section.group}
                  createdAt={section.createdAt}
                  slug={section.slug}
                  allowedRoles={section.allowedRoles}
                  // a section has `children`, reserved prop in React: don't spread the whole section as props for a component or it will bug !
                  sectionChildren={section.children}
                />
                {!!isRoot && <div className="mr-4" />}
              </React.Fragment>
            ))}
            {!sections.length && <span className="w-full p-10 text-gray-400 block">Pas de rubrique</span>}
          </div>
        </section>
        {!!isSaving && (
          <div className="absolute w-full h-full top-0 left-0 bg-gray-500 opacity-25 pointer-events-none">
            <Loader color="#bbbbbb" size={100} />
          </div>
        )}
      </main>
      <Modal
        fullScreen
        isOpen={readOnly}
        onRequestClose={() => setReadOnly(false)}
        closeButton={
          <button type="button" className="fixed h-16 top-0 w-full rounded-none" onClick={() => setReadOnly((r) => !r)}>
            Retour à l'édition
          </button>
        }
        className="pt-16"
      >
        {section.type === "root" ? (
          <KnowledgeBasePublicHome item={{ ...section, children: section.children.filter((c) => c.status === "PUBLISHED" && c.allowedRoles.includes(seeAs)) }} />
        ) : (
          <KnowledgeBasePublicContent item={{ ...section, children: section.children.filter((c) => c.status === "PUBLISHED" && c.allowedRoles.includes(seeAs)) }} />
        )}
      </Modal>
    </article>
  );
};

export default withAuth(KnowledgeBaseAdminSection);
