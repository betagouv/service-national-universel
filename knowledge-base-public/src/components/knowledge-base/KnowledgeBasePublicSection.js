import { useState, useEffect } from "react";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCard";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import React from "react";
import { Accordion } from "../Accordion";
import LoaderArticle from "../LoaderArticle";

const KnowledgeBasePublicSection = ({ item, isRoot, isLoading, device }) => {
  const [sections, setSections] = useState(item?.children?.filter((c) => c.type === "section") || []);
  const [articles, setArticles] = useState(item?.children?.filter((c) => c.type === "article") || []);

  useEffect(() => {
    setSections(item?.children?.filter((c) => c.type === "section") || []);
  }, [item]);

  useEffect(() => {
    setArticles(item?.children?.filter((c) => c.type === "article") || []);
  }, [item]);

  if (isLoading) {
    return (
      <>
        <div className="flex w-full items-center justify-center px-4">
          <div className="mt-3 flex w-full flex-col items-center justify-center">
            <LoaderArticle key="loader_article-1" className="mb-3" />
            <LoaderArticle key="loader_article-2" className="mb-3" />
            <LoaderArticle key="loader_article-3" className="mb-3" />
            <LoaderArticle key="loader_article-4" className="mb-3" />
          </div>
        </div>
      </>
    );
  }

  if (isRoot) {
    return (
      <>
        <div className="mx-auto mt-[-75px] px-4 md:mt-[-80px]">
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
                />
              ) : (
                <>{children && children.length > 0 && <Accordion key={_id} title={title} list={children} className="mb-3" path="/base-de-connaissance" />}</>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center px-4">
      {sections.length > 0 && (
        <div key={"sections"} className="mt-3 flex w-full flex-col items-center justify-center">
          {sections.map(({ title, children, _id }) => {
            return <>{children && children.length > 0 && <Accordion key={_id} title={title} list={children} className="mb-3 w-full" path="/base-de-connaissance" />}</>;
          })}
        </div>
      )}
      {articles.length > 0 && (
        <div key="articles" className="mt-3 flex w-full flex-col items-center justify-center">
          {articles.map(({ _id, title, slug }) => (
            <KnowledgeBaseArticleCard key={_id} className="mb-3" title={title} slug={slug} path="/base-de-connaissance" />
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasePublicSection;
