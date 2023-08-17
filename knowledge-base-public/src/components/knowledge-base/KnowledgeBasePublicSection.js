import { useState, useEffect } from "react";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCard";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import { Accordion } from "../Accordion";
import LoaderSection from "../LoaderSection";
import Breadcrumbs from "../breadcrumbs";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import React from "react";
import { useRouter } from "next/router";
import KnowledgeBaseSearch from "./KnowledgeBaseSearch";
import { HiSearch } from "react-icons/hi";

const KnowledgeBasePublicSection = ({ item, isRoot, isLoading, device }) => {
  const router = useRouter();
  const [sections, setSections] = useState(item?.children?.filter((c) => c.type === "section") || []);
  const [articles, setArticles] = useState(item?.children?.filter((c) => c.type === "article") || []);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setSections(item?.children?.filter((c) => c.type === "section") || []);
  }, [item]);

  useEffect(() => {
    setArticles(item?.children?.filter((c) => c.type === "article") || []);
  }, [item]);

  if (isRoot) {
    return (
      <>
        <div className="flex h-44 w-full flex-col justify-center gap-6 border-t-[1px] border-white border-opacity-20 bg-[#32257F]">
          <p className="text-center text-3xl font-bold leading-9 text-white">J&apos;ai besoin d&apos;aide</p>
          <button
            onClick={() => setSearchOpen(true)}
            className={`mx-4 flex max-w-2xl cursor-text gap-4 rounded-lg bg-white p-3 text-gray-600 md:mx-auto md:w-full ${searchOpen && "invisible"}`}
          >
            <HiSearch className="text-2xl text-gray-500" />
            Rechercher un article
          </button>
        </div>

        <div className="h-32 w-full bg-[#32257F]" />
        <div className="mx-auto mt-[-100px] w-full px-4 md:w-auto">
          <div className="col-span-full grid-cols-2 gap-2.5 md:grid lg:max-w-screen-95 lg:grid-cols-3 lg:overflow-hidden lg:px-6">
            <h2 className="col-span-2 mb-4 text-xl font-bold text-white md:mx-2 lg:col-span-3">Thématiques générales</h2>
            {!isLoading ? (
              sections.map(({ _id, position, icon, title, slug, children }) => {
                return device === "desktop" && children?.length ? (
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
                  <>{children?.length && <Accordion key={_id} title={title} list={children} className="mb-3" path="/base-de-connaissance" slug={slug} />}</>
                );
              })
            ) : (
              <>
                <LoaderSection className="mb-3 md:mx-2 md:mb-8" />
                <LoaderSection className="mb-3 md:mx-2 md:mb-8" />
                <LoaderSection className="mb-3 md:mx-2 md:mb-8" />
                <LoaderSection className="mb-3 md:mx-2 md:mb-8" />
              </>
            )}
          </div>
        </div>
        <KnowledgeBaseSearch open={searchOpen} setOpen={setSearchOpen} />
      </>
    );
  }

  return (
    <>
      <div className="min-h-60 md:min-h-48 w-full border-t-[1px] border-white border-opacity-20 bg-[#32257F] pb-[50px] text-white">
        <div className="mx-auto mt-6 space-y-1 px-4 md:w-[712px]">
          <Breadcrumbs parents={item?.parents || []} path="/base-de-connaissance" className="text-white" />
          <h1 className="text-3xl font-bold leading-9">{item?.title}</h1>
        </div>
      </div>

      <div className="mx-auto mt-[-40px] flex w-full max-w-[730px] flex-col items-start justify-center px-4">
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
        <div className="ml-2">
          <KnowledgeBasePublicNoAnswer />
        </div>
      </div>
    </>
  );
};

export default KnowledgeBasePublicSection;
