import React, { useEffect, useRef } from "react";
import SortableJS from "sortablejs";
import { toast } from "react-toastify";
import withAuth from "../../hocs/withAuth";
import API from "../../services/api";
import KnowledgeBaseCardSection from "./KnowledgeBaseCardSection";
import KnowledgeBaseCardArticle from "./KnowledgeBaseCardArticle";
import KnowledgeBaseCreate from "./KnowledgeBaseCreate";
import Tags from "../Tags";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";

const KnowledgeBaseSection = ({ section, isRoot }) => {
  const { mutate } = useKnowledgeBaseData();
  const gridSectionsRef = useRef(null);
  const gridAnswersRef = useRef(null);
  const sortableSections = useRef(null);
  const sortableAnswers = useRef(null);

  const onListChange = async (list) => {
    const gridRef = list === "sections" ? gridSectionsRef : gridAnswersRef;
    const newSort = [...gridRef.current.children]
      .map((i) => i.dataset.id)
      .map((id) => section.children.find((item) => item._id === id))
      .map((sortedItem, index) => ({ ...sortedItem, position: index + 1 }));

    const response = await API.put({
      path: "/support-center/knowledge-base/reorder",
      body: newSort.map(({ _id, position, title }) => ({ _id, position, title, parentId: section._id })),
    });
    if (!response.ok) return toast.error("Désolé, une erreur est survenue. Veuillez recommencer !");
    mutate();
  };

  const sections = section.children.filter((c) => c.type === "section");
  const answers = section.children.filter((c) => c.type === "article");

  useEffect(() => {
    sortableSections.current = new SortableJS(gridSectionsRef.current, { animation: 150, group: "sections", onEnd: () => onListChange("sections") });
    sortableAnswers.current = new SortableJS(gridAnswersRef.current, { animation: 150, group: "answers", onEnd: () => onListChange("answers") });
  }, []);

  return (
    <article className="container bg-coolGray-100 mx-auto flex flex-col flex-grow h-full relative w-full flex-shrink overflow-hidden">
      {!isRoot && (
        <header className="px-8 py-3 flex flex-col">
          <h2 className={`font-bold text-lg`}>{section.title}</h2>
          {!!section.description?.length && <p className="mt-1 text-sm italic">{section.description}</p>}
          {!!section.allowedRoles?.length && (
            <p className="flex flex-wrap mt-3.5  text-sm">
              Visible par: <Tags tags={section.allowedRoles} />
            </p>
          )}
        </header>
      )}
      <main className="flex h-full w-fullmax-w-screen-2xl flex-shrink overflow-y-auto">
        <section className="flex flex-col flex-grow flex-shrink-0 border-r-2 pt-12 px-12">
          <h3 className="px-10 text-coolGray-500 flex items-center font-bold">
            Articles
            <KnowledgeBaseCreate position={section.children.length + 1} parentId={section._id} type="article" />
          </h3>
          <div ref={gridAnswersRef} id="answers" className="flex flex-col h-full w-full flex-shrink overflow-y-auto">
            {answers.map(KnowledgeBaseCardArticle)}
            {!answers.length && <span className="self-center w-full py-10 text-gray-400 block">Pas d'article</span>}
          </div>
        </section>
        <section className="flex flex-col w-72 flex-shrink-0  pt-12 mx-12">
          <h3 className="px-10 text-coolGray-500 flex items-center font-bold">
            Rubriques
            <KnowledgeBaseCreate position={section.children.length + 1} parentId={section._id} type="section" />
          </h3>
          <div ref={gridSectionsRef} id="sections" className="flex flex-wrap h-full w-full flex-shrink overflow-y-auto">
            {sections.map((section) => (
              <KnowledgeBaseCardSection
                _id={section._id}
                key={section._id}
                imageSrc={section.imageSrc}
                position={section.position}
                imageAlt={section.imageAlt}
                title={section.title}
                createdAt={section.createdAt}
                slug={section.slug}
                allowedRoles={section.allowedRoles}
                // a section has `children`, reserved prop in React: don't spread the whole section as props for a component or it will bug !
                sectionChildren={section.children}
              />
            ))}
            {!sections.length && <span className="w-full p-10 text-gray-400 block">Pas de rubrique</span>}
          </div>
        </section>
      </main>
    </article>
  );
};

export default withAuth(KnowledgeBaseSection);
