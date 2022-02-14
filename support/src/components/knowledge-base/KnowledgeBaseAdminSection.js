import React, { useContext, useEffect, useRef, useState } from "react";
import SortableJS from "sortablejs";
import { toast } from "react-toastify";
import { SUPPORT_ROLES } from "snu-lib/roles";
import { Popover } from "@headlessui/react";
import withAuth from "../../hocs/withAuth";
import API from "../../services/api";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCard";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import KnowledgeBaseAdminItemCreate from "./KnowledgeBaseAdminItemCreate";
import Tags from "../Tags";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";
import Loader from "../Loader";
import Modal from "../Modal";
import KnowledgeBasePublicContent from "./KnowledgeBasePublicContent";
import KnowledgeBasePublicHome from "./KnowledgeBasePublicHome";
import SeeAsContext from "../../hooks/useSeeAs";

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
    <article className="container relative mx-auto flex h-full w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100">
      <header className="flex w-full justify-between border-2 px-8 py-3">
        <h2 className="text-lg font-bold">
          {isRoot ? "Home" : section.title}
          {!!section.description?.length && <p className="mt-1 text-sm italic">{section.description}</p>}
          {!!section.allowedRoles?.length && (
            <p className="mt-3.5 flex flex-wrap text-sm font-normal">
              Visible par: <Tags tags={section.allowedRoles} />
            </p>
          )}
        </h2>
        <Popover className="my-auto">
          <Popover.Button>Prévisualiser</Popover.Button>
          <Popover.Panel className="absolute right-0 top-10 z-10 min-w-[208px] lg:min-w-0">
            <div className="flex flex-col gap-4 rounded-md border border-gray-300 bg-white px-4 py-3">
              {Object.keys(SUPPORT_ROLES).map((role) => (
                <a
                  key={role}
                  onClick={() => {
                    setReadOnly((r) => !r);
                    setSeeAs(role);
                  }}
                  className={`text-sm font-${seeAs === role ? "bold" : "medium"} cursor-pointer text-gray-700`}
                >
                  Voir en tant que {SUPPORT_ROLES[role]}
                </a>
              ))}
            </div>
          </Popover.Panel>
        </Popover>
      </header>
      <main className={`flex h-full ${isRoot ? "flex-col" : ""} w-full max-w-screen-2xl flex-shrink overflow-y-auto`}>
        <section className={`flex flex-col  ${isRoot ? "order-2 w-full" : ""} shrink-0 flex-grow-[4] border-r-2 px-12 pt-6`}>
          <h3 className="flex items-center px-10 text-sm font-bold uppercase text-snu-purple-900">
            Sujets
            <KnowledgeBaseAdminItemCreate position={section.children.length + 1} parentId={section._id} type="article" />
          </h3>
          <div ref={gridAnswersRef} id="articles" className="flex h-full w-full flex-shrink flex-col overflow-y-auto">
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
            {!articles.length && <span className="block w-full self-center py-10 text-gray-400">Pas d'article</span>}
          </div>
        </section>
        <section className={`flex flex-col ${isRoot ? "w-full" : ""} shrink-0 flex-grow-[2]  pt-6`}>
          <h3 className="flex items-center px-10 text-sm font-bold uppercase text-snu-purple-900">
            Catégories
            <KnowledgeBaseAdminItemCreate position={section.children.length + 1} parentId={section._id} type="section" />
          </h3>
          <div ref={gridSectionsRef} id="sections" className={`flex ${isRoot ? "justify-center" : ""} w-full flex-shrink flex-wrap overflow-y-auto px-12`}>
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
            {!sections.length && <span className="block w-full p-10 text-gray-400">Pas de rubrique</span>}
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
          <button type="button" className="fixed top-0 h-16 w-full rounded-none" onClick={() => setReadOnly((r) => !r)}>
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
