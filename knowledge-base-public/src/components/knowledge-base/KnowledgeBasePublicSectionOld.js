import { useState, useEffect } from "react";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCardOld";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import LoaderArticle from "../LoaderArticle";
import LoaderSection from "../LoaderSectionOld";

const KnowledgeBasePublicSection = ({ item, isRoot, isLoading }) => {
  const [sections, setSections] = useState(item?.children?.filter((c) => c.type === "section") || []);
  useEffect(() => {
    setSections(item?.children?.filter((c) => c.type === "section") || []);
  }, [item]);

  const [articles, setArticles] = useState(item?.children?.filter((c) => c.type === "article") || []);
  useEffect(() => {
    setArticles(item?.children?.filter((c) => c.type === "article") || []);
  }, [item]);

  if (isLoading) {
    return (
      <main className="flex h-full flex-shrink flex-col justify-evenly overflow-y-auto sm:px-2 lg:flex-row lg:px-0">
        <section className="flex max-w-4xl shrink-0 flex-grow flex-col pt-12">
          <h3 className="flex items-center text-sm font-bold uppercase text-snu-purple-900 sm:px-4 sm:pb-2 lg:px-16">Sujets</h3>
          <div id="articles" className="flex h-full w-full flex-shrink flex-col overflow-y-auto sm:px-2 sm:pb-4 lg:px-12">
            <LoaderArticle />
            <LoaderArticle />
            <LoaderArticle />
            <LoaderArticle />
            <LoaderArticle />
            <LoaderArticle />
          </div>
        </section>
        <section className="flex shrink-0 flex-col sm:mt-4 lg:w-96  lg:border-l-2 lg:pt-12">
          <h3 className="flex items-center px-4 text-sm font-bold uppercase text-snu-purple-900 lg:px-16">Catégories</h3>
          <div id="sections" className="flex w-full flex-col overflow-y-auto sm:items-center md:flex-shrink md:flex-row md:flex-wrap md:justify-center md:px-4 md:pb-4 lg:px-12">
            <LoaderSection />
          </div>
        </section>
      </main>
    );
  }

  if (isRoot) {
    return (
      <>
        <div className="col-span-full row-span-2 row-start-2 mx-auto grid-cols-2 flex-col flex-wrap justify-center gap-2.5 md:grid md:flex-row md:px-10 lg:flex lg:max-w-screen-95 lg:overflow-hidden lg:px-6">
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
        <main className="flex h-full flex-shrink flex-col justify-evenly overflow-y-auto sm:px-2 lg:flex-row lg:px-0">
          <section className="flex max-w-4xl shrink-0 flex-grow flex-col pt-12">
            <h3 className="flex items-center text-sm font-bold uppercase text-snu-purple-900 sm:px-4 sm:pb-2 lg:px-16">Sujets</h3>
            <div id="articles" className="flex h-full w-full flex-shrink flex-col overflow-y-auto sm:px-2 sm:pb-4 lg:px-12">
              {articles.map((article) => (
                <KnowledgeBaseArticleCard key={article._id} _id={article._id} position={article.position} title={article.title} slug={article.slug} path="/base-de-connaissance" />
              ))}
            </div>
          </section>
        </main>
      </>
    );
  }
  return (
    <main className="flex h-full flex-shrink flex-col justify-evenly overflow-y-auto sm:px-2 lg:flex-row lg:px-0">
      <section className="flex max-w-4xl shrink-0 flex-grow flex-col pt-12">
        <h3 className="flex items-center text-sm font-bold uppercase text-snu-purple-900 sm:px-4 sm:pb-2 lg:px-16">Sujets</h3>
        <div id="articles" className="flex h-full w-full flex-shrink flex-col overflow-y-auto sm:px-2 sm:pb-4 lg:px-12">
          {articles.map((article) => (
            <KnowledgeBaseArticleCard key={article._id} _id={article._id} position={article.position} title={article.title} slug={article.slug} path="/base-de-connaissance" />
          ))}
        </div>
      </section>
      {!!sections?.length && (
        <section className="flex shrink-0 flex-col sm:mt-4 lg:w-96  lg:border-l-2 lg:pt-12">
          <h3 className="flex items-center px-4 text-sm font-bold uppercase text-snu-purple-900 lg:px-16">Catégories</h3>
          <div id="sections" className="flex w-full flex-col overflow-y-auto sm:items-center md:flex-shrink md:flex-row md:flex-wrap md:justify-center md:px-4 md:pb-4 lg:px-12">
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
