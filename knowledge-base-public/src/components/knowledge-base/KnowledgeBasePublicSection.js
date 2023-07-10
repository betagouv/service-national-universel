import { useState, useEffect } from "react";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCard";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import LoaderSection from "../LoaderSectionOld";
import React from "react";
import { Accordion } from "../Accordion";

const KnowledgeBasePublicSection = ({ item, isRoot, isLoading, device }) => {
  const [sections, setSections] = useState(item?.children?.filter((c) => c.type === "section") || []);
  const [articles, setArticles] = useState(item?.children?.filter((c) => c.type === "article") || []);

  useEffect(() => {
    setSections(item?.children?.filter((c) => c.type === "section") || []);
  }, [item]);

  useEffect(() => {
    setArticles(item?.children?.filter((c) => c.type === "article") || []);
  }, [item]);

  if (isLoading || !device) {
    return (
      <section className="flex h-full flex-shrink flex-col justify-evenly overflow-y-auto sm:px-2 lg:flex-row lg:px-0">
        <div className="flex shrink-0 flex-col sm:mt-4 lg:w-96  lg:border-l-2 lg:pt-12">
          <h3 className="flex items-center px-4 text-sm font-bold uppercase text-snu-purple-900 lg:px-16">Catégories</h3>
          <div id="sections" className="flex w-full flex-col overflow-y-auto sm:items-center md:flex-shrink md:flex-row md:flex-wrap md:justify-center md:px-4 md:pb-4 lg:px-12">
            <LoaderSection />
          </div>
        </div>
      </section>
    );
  }
  if (isRoot) {
    return (
      <>
        <main className="mx-auto mt-[-75px] px-4 md:mt-[-80px]">
          <div className="col-span-full grid-cols-2 gap-2.5 md:grid lg:max-w-screen-95 lg:grid-cols-3 lg:overflow-hidden lg:px-6 2xl:grid-cols-4">
            <h2 className="col-span-2 mb-4 text-xl font-bold text-white md:mx-2 lg:col-span-3 2xl:col-span-4">Thématiques générales</h2>
            {sections.map(({ _id, position, icon, title, slug, children }) => {
              return device === "desktop" ? (
                <KnowledgeBaseSectionCard
                  key={_id}
                  _id={_id}
                  path="/base-de-connaissance"
                  position={position}
                  icon={icon}
                  title={title}
                  slug={slug}
                  children={(children || []).slice(0, 3)}
                  className="mx-2 mb-8"
                  isRoot={isRoot}
                />
              ) : (
                <>{children && children.length > 0 && <Accordion title={title} list={children} className="mb-3" path="/base-de-connaissance" />}</>
              );
            })}
          </div>
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
