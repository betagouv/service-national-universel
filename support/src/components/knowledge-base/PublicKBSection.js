import { useState, useEffect } from "react";
import KBSectionCard from "./KBSectionCard";
import KBArticleCard from "./KBArticleCard";

const PublicKBSection = ({ item }) => {
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
      <div className="md:px-10 px-6 flex lg:flex flex-col lg:flex-nowrap overflow-hidden max-w-screen-95 mx-auto flex-wrap grid-cols-2 md:grid md:flex-row row-span-2 row-start-2 col-span-full gap-2.5 h-84">
        {sections.map((section) => (
          <KBSectionCard
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
    <main className="flex justify-evenly h-full w-fullmax-w-screen-2xl flex-shrink overflow-y-auto">
      <section className="flex flex-col flex-grow flex-shrink-0 pt-12 px-12 max-w-4xl">
        <h3 className="px-10 flex items-center font-bold uppercase text-sm text-snu-purple-900">Sujets</h3>
        <div id="articles" className="flex flex-col h-full w-full flex-shrink overflow-y-auto">
          {articles.map((answer) => (
            <KBArticleCard key={answer._id} _id={answer._id} position={answer.position} title={answer.title} slug={answer.slug} path="/base-de-connaissance" />
          ))}
        </div>
      </section>
      {!!sections?.length && (
        <section className="flex flex-col w-96 flex-shrink-0  border-l-2 pt-12 ">
          <h3 className="px-10 flex items-center font-bold uppercase text-sm text-snu-purple-900">Catégories</h3>
          <div id="sections" className="flex flex-wrap w-full flex-shrink overflow-y-auto px-12">
            {sections.map((section) => (
              <KBSectionCard
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

export default PublicKBSection;
