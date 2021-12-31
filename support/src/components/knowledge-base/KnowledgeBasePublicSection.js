import { useState, useEffect } from "react";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCard";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";

const KnowledgeBasePublicSection = ({ item }) => {
  const [sections, setSections] = useState(item.children?.filter((c) => c.type === "section") || []);
  useEffect(() => {
    setSections(item.children?.filter((c) => c.type === "section") || []);
  }, [item]);

  const [articles, setArticles] = useState(item.children?.filter((c) => c.type === "article") || []);
  useEffect(() => {
    setArticles(item.children?.filter((c) => c.type === "article") || []);
  }, [item]);

  if (!articles.length) {
    return (
      <div className="md:px-10 lg:px-6 lg:flex flex-col flex-wrap justify-center lg:overflow-hidden lg:max-w-screen-95 mx-auto grid-cols-2 md:grid md:flex-row row-span-2 row-start-2 col-span-full gap-2.5">
        {sections.map((section) => (
          <KnowledgeBaseSectionCard
            key={section._id}
            _id={section._id}
            path="/base-de-connaissance"
            position={section.position}
            imageSrc={section.imageSrc}
            icon={section.icon}
            title={section.title}
            group={section.group}
            createdAt={section.createdAt}
            slug={section.slug}
          />
        ))}
      </div>
    );
  }
  return (
    <main className="flex flex-col sm:px-2 lg:flex-row lg:px-0 justify-evenly h-full w-fullmax-w-screen-2xl flex-shrink overflow-y-auto">
      <section className="flex flex-col flex-grow flex-shrink-0 pt-12 max-w-4xl">
        <h3 className="sm:px-4 sm:pb-2 lg:px-16 flex items-center font-bold uppercase text-sm text-snu-purple-900">Sujets</h3>
        <div id="articles" className="flex flex-col sm:pb-4 sm:px-2 h-full w-full flex-shrink overflow-y-auto lg:px-12">
          {articles.map((answer) => (
            <KnowledgeBaseArticleCard key={answer._id} _id={answer._id} position={answer.position} title={answer.title} slug={answer.slug} path="/base-de-connaissance" />
          ))}
        </div>
      </section>
      {!!sections?.length && (
        <section className="flex flex-col sm:mt-4 lg:w-96 flex-shrink-0  lg:border-l-2 lg:pt-12">
          <h3 className="px-4 lg:px-16 flex items-center font-bold uppercase text-sm text-snu-purple-900">Catégories</h3>
          <div id="sections" className="flex flex-col w-full overflow-y-auto sm:items-center md:flex-row md:justify-center md:flex-wrap md:flex-shrink md:px-4 md:pb-4 lg:px-12">
            {sections.map((section) => (
              <KnowledgeBaseSectionCard
                key={section._id}
                _id={section._id}
                path="/base-de-connaissance"
                position={section.position}
                imageSrc={section.imageSrc}
                icon={section.icon}
                title={section.title}
                group={section.group}
                createdAt={section.createdAt}
                slug={section.slug}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default KnowledgeBasePublicSection;
