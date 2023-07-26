import { useState, useEffect } from "react";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCard";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import { Accordion } from "../Accordion";
import LoaderArticle from "../LoaderArticle";
import Breadcrumbs from "../breadcrumbs";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import React from "react";
import { useRouter } from "next/router";

const KnowledgeBasePublicSection = ({ item, isRoot, isLoading, device }) => {
  const router = useRouter();
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
        <div className="h-48 w-full border-t-[1px] border-white border-opacity-20 bg-[#32257F]" />
        <div className="mx-auto mt-[-100px] px-4">
          <div className="col-span-full grid-cols-2 gap-2.5 md:grid lg:max-w-screen-95 lg:grid-cols-3 lg:overflow-hidden lg:px-6">
            <h2 className="col-span-2 mb-4 text-xl font-bold text-white md:mx-2 lg:col-span-3">Thématiques générales</h2>
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
                  // eslint-disable-next-line react/no-children-prop
                  children={(children || []).slice(0, 3)}
                  className="mx-2 mb-8"
                />
              ) : (
                <>{children && children.length > 0 && <Accordion key={_id} title={title} list={children} className="mb-3" path="/base-de-connaissance" slug={slug} />}</>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-48 w-full border-t-[1px] border-white border-opacity-20 bg-[#32257F] text-white">
        <div className="mx-auto mt-14 space-y-1 px-4 md:w-[712px]">
          <Breadcrumbs parents={item?.parents || []} path="/base-de-connaissance" />
          <h1 className="text-3xl font-bold leading-9">{item?.title}</h1>
        </div>
      </div>

      <div className="mt-[-40px] flex w-full flex-col items-center justify-center px-4">
        {sections.length > 0 && (
          <div key={"sections"} className="mt-3 flex w-full flex-col items-center justify-center">
            {sections.map(({ title, children, _id, slug }) => (
              <Accordion key={_id} title={title} list={children} className="mb-3 w-full" path="/base-de-connaissance" isOpen={router.query.openTheme === slug} slug={slug} />
            ))}
          </div>
        )}
        {articles.length > 0 && (
          <div key="articles" className="mt-3 flex w-full flex-col items-center justify-center">
            {articles.map(({ _id, title, slug }) => (
              <KnowledgeBaseArticleCard key={_id} className="mb-3" title={title} slug={slug} path="/base-de-connaissance" />
            ))}
          </div>
        )}
        <div className="mx-auto">
          <KnowledgeBasePublicNoAnswer />
        </div>
      </div>
    </>
  );
};

export default KnowledgeBasePublicSection;
