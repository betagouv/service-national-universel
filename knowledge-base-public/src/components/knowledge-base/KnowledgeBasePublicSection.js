import { useState, useEffect, useRef } from "react";
import KnowledgeBaseSectionCard from "./KnowledgeBaseSectionCard";
import KnowledgeBaseArticleCard from "./KnowledgeBaseArticleCard";
import { Accordion } from "../Accordion";
import LoaderSection from "../LoaderSection";
import Breadcrumbs from "../breadcrumbs";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import React from "react";
import { useRouter } from "next/router";
import KnowledgeBaseSearch from "./KnowledgeBaseSearch";
import { HiSearch, HiStar } from "react-icons/hi";
import Link from "next/link";
import { environment } from "../../config";

const KnowledgeBasePublicSection = ({ item, isRoot, isLoading, device }) => {
  const router = useRouter();
  const [sections, setSections] = useState(item?.children?.filter((c) => c.type === "section") || []);
  const [articles, setArticles] = useState(item?.children?.filter((c) => c.type === "article") || []);
  const topArticles = (item?.children?.filter((c) => c.type === "article") || []).sort((a, b) => b.read - a.read);
  const [searchOpen, setSearchOpen] = useState(false);

  const scrollRef = useRef(null);

  const articleFromSection = [];
  sections.map(({ children }) => {
    console.log(children);
    for (const e in children) {
      console.log(e);
      if (children[e].type === "article") {
        articleFromSection.push(children[e]);
      }
    }
  });
  const Top5Articles = articleFromSection.sort((a, b) => b.read - a.read)

  useEffect(() => {
    function handleScroll() {
      const el = scrollRef.current;
      if (el) {
        const isScrollEnd = el.scrollWidth - el.scrollLeft === el.clientWidth;

        if (isScrollEnd) {
          el.style.borderRight = "none";
        } else {
          el.style.borderRight = "1px solid #ccc"; // Remplacez #ccc par la couleur de votre choix
        }
      }
    }

    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (el) {
        el.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

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
          <div className={`transition-max-height flex flex-row overflow-x-auto duration-700 md:gap-2`}>
                {Top5Articles.slice(0, 5).map(({ _id, title, slug }) => (
                  <div
                    key={_id}
                    className="mx-3.5 my-2 flex min-h-[130px] min-w-[200px] flex-col justify-between rounded-lg border-[1px] border-gray-300 bg-white px-4 py-2 md:m-2 md:min-w-[30%] md:max-w-[30%] md:flex-grow"
                  >
                    <h3 className="mb-4 text-sm font-bold leading-5 text-gray-900">{title}</h3>
                    <Link href={`/base-de-connaissance/${slug}`} aria-label={`Lire l'article ${title}`} alt={`Lire l'article ${title}`}>
                      <p className="line-clamp-2 text-sm font-normal leading-5 text-blue-600">Lire L'article</p>
                    </Link>
                  </div>
                ))}
              </div>
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
      <div className="mx-auto mt-[-50px] flex w-full max-w-[730px] flex-col items-center justify-center px-4">
        {environment !== "production" && articles.length > 5 && item.parents.length > 0 && (
          <>
            <div className="px-auto mt-6 flex w-full max-w-[730px] flex-col rounded-lg bg-[#E3E3FB] pb-4 pt-2 shadow-md md:px-2">
              <div className="ml-2 flex cursor-pointer flex-row items-center justify-between md:ml-[0px]">
                <div className="flex flex-row">
                  <HiStar className="ml-1.5 mr-2 mt-2.5 text-xl text-gray-900" />
                  <p className="py-2 text-base font-bold leading-6 text-gray-900">Articles les plus consultés</p>
                </div>
              </div>
              <div className={`transition-max-height flex flex-row overflow-x-auto duration-700 md:gap-2`}>
                {topArticles.slice(0, 3).map(({ _id, title, slug }) => (
                  <div
                    key={_id}
                    className="mx-3.5 my-2 flex min-h-[130px] min-w-[200px] flex-col justify-between rounded-lg border-[1px] border-gray-300 bg-white px-4 py-2 md:m-2 md:min-w-[30%] md:max-w-[30%] md:flex-grow"
                  >
                    <h3 className="mb-4 text-sm font-bold leading-5 text-gray-900">{title}</h3>
                    <Link href={`/base-de-connaissance/${slug}`} aria-label={`Lire l'article ${title}`} alt={`Lire l'article ${title}`}>
                      <p className="line-clamp-2 text-sm font-normal leading-5 text-blue-600">Lire L'article</p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
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
