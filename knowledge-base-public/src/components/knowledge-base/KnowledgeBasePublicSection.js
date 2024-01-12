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
import useUser from "../../hooks/useUser";
import API from "../../services/api";
import { separateEmojiAndText } from "../../utils/index";
import { Emoji } from "../Emoji";

const KnowledgeBasePublicSection = ({ item, isRoot, isLoading, device }) => {
  const { restriction } = useUser();
  const router = useRouter();
  const [sections, setSections] = useState(item?.children?.filter((c) => c.type === "section") || []);
  const [articles, setArticles] = useState(item?.children?.filter((c) => c.type === "article") || []);
  const [top4Article, setTop4Article] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const scrollRef = useRef(null);

  // useEffect(() => {
  //   const fetchTop4 = async () => {
  //     const NumberOfTopArticle = 4
  //     try {
  //       const response = await API.get({ path: `/knowledge-base/${restriction}/top4Article/${NumberOfTopArticle}` });
  //       const rawData = response.data;
  //       const processedData = rawData.map((article) => {
  //         const { _id, title, slug } = article;
  //         const [emoji, text] = separateEmojiAndText(title);
  //         return {
  //           _id,
  //           title,
  //           slug,
  //           emoji,
  //           text,
  //         };
  //       });

  //       setTop4Article(processedData);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   fetchTop4();
  // }, [item]);

  const getAllArticles = (children) => {
    let articles = [];

    if (!children || !Array.isArray(children)) {
      return articles;
    }

    for (let child of children) {
      if (child.type === "article") {
        articles.push(child);
      }
      if (child.type === "section" && Array.isArray(child.children)) {
        articles = articles.concat(getAllArticles(child.children));
      }
    }

    return articles;
  };
  const topArticles = getAllArticles(item?.children).sort((a, b) => b.read - a.read);
  console.log(articles);
  useEffect(() => {
    function handleScroll() {
      const el = scrollRef.current;
      if (el) {
        const isScrollEnd = el.scrollWidth - el.scrollLeft === el.clientWidth;

        if (isScrollEnd) {
          el.style.borderRight = "none";
        } else {
          el.style.borderRight = "1px solid #ccc";
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
        <div className="w-full flex flex-col justify-center gap-6 border-t-[1px] border-white border-opacity-20 bg-[#32257F]">
          <p className="text-center text-3xl mt-8 mb-1 font-bold leading-9 text-white">J&apos;ai besoin d&apos;aide</p>
          <button
            onClick={() => setSearchOpen(true)}
            className={`mx-4 mb-2 flex max-w-2xl cursor-text gap-4 rounded-lg bg-white p-3 text-gray-600 md:mx-auto md:w-full ${searchOpen && "invisible"}`}
          >
            <HiSearch className="text-2xl text-gray-500" />
            Rechercher un article
          </button>
        </div>
        {/* <div className="flex justify-center bg-[#32257F]">
          <div className="mx-auto flex max-w-[90%] flex-row flex-wrap justify-center lg:max-w-[70%]">
            {top4Article.map(({ _id, slug, text }) => (
              <div key={_id} className="m-1 rounded-2xl bg-blue-100 px-2 py-1 text-center lg:w-auto">
                <Link
                  href={`/base-de-connaissance/${slug}`}
                  aria-label={`Lire l'article ${text}`}
                  alt={`Lire l'article ${text}`}
                  className="text-sm font-medium leading-5 text-blue-800 flex justify-center"
                >
                  {text}
                </Link>
              </div>
            ))}
          </div>
        </div> */}

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
        {topArticles.length >= 4 && !item.parents[1] && (
          <>
            <div className="px-auto mt-6 flex w-full max-w-[730px] flex-col rounded-lg bg-[#E3E3FB] pb-4 pt-2 shadow-md md:px-2">
              <div className="ml-2 flex cursor-pointer flex-row items-center justify-between md:ml-[0px]">
                <div className="flex flex-row">
                  <HiStar className="ml-1.5 mr-2 mt-2.5 text-xl text-gray-900" />
                  <p className="py-2 text-base font-bold leading-6 text-gray-900">Articles les plus consultés</p>
                </div>
              </div>
              <div className={`transition-max-height flex flex-row overflow-x-auto duration-700 md:gap-2`}>
                {topArticles.slice(0, 3).map(({ _id, title, slug }) => {
                  const [emoji, text] = separateEmojiAndText(title);
                  return (
                    <div
                      key={_id}
                      className="mx-3.5 my-2 flex min-h-[130px] min-w-[200px] flex-col justify-between rounded-lg border-[1px] border-gray-300 bg-white px-4 py-2 md:m-2 md:min-w-[30%] md:max-w-[30%] md:flex-grow"
                    >
                      <h3 className="mb-4 text-sm font-bold leading-5 text-gray-900">
                        <Emoji emoji={emoji} />
                        {text}
                      </h3>
                      <Link href={`/base-de-connaissance/${slug}`} aria-label={`Lire l'article ${title}`} alt={`Lire l'article ${title}`}>
                        <p className="line-clamp-2 text-sm font-normal leading-5 text-blue-600">Lire L'article</p>
                      </Link>
                    </div>
                  );
                })}
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
