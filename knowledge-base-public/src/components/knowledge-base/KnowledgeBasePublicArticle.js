import TextEditor from "../TextEditor";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import API from "../../services/api";
import { useMemo, useEffect, useState } from "react";
import { Accordion } from "../Accordion";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import Breadcrumbs from "../breadcrumbs";
import FeedbackComponent from "../FeedBack";
import NavigationArticle from "../NavigationArticle";
import { HiPrinter } from "react-icons/hi";
import { HiChevronLeft } from "react-icons/hi";

const KnowledgeBasePublicArticle = ({ item, isLoading }) => {
  const group = useMemo(() => {
    return item?.group || item?.parents?.[0]?.group;
  }, [item]);
  // const router = useRouter();
  // const { cache } = useSWRConfig();
  // const parentId = item.parentId;
  // const [siblingsData, setSiblingsData] = useState([]); // État pour stocker les données des frères et sœurs

  // useEffect(() => {
  //   const fetchSiblings = async () => {
  //     try {
  //       const response = await API.post({ path: `/knowledge-base/getSiblings`, body: { parentId } });
  //       setSiblingsData(response.siblings);
  //     } catch (error) {
  //       console.error(error);
  //       // Gérer les erreurs ici
  //     }
  //   };

  //   fetchSiblings();
  // }, []);

  if (!item || isLoading) return <ArticleLoader />;
  return (
    <div className="w-full bg-white">
      <section className="mx-auto flex max-w-[950px] flex-shrink flex-grow flex-col overflow-hidden px-4 text-gray-800 print:bg-transparent print:pb-12">
        <Breadcrumbs parents={item?.parents || []} path="/base-de-connaissance" />
        <div className="flex flex-col align-center md:flex-row">
          {item.parents.length > 2 && (
            <div className="md:mr-12 mt-4 max-w-[400px]">
              <NavigationArticle item={item} />
              {/* <Accordion key={item._id} title={item.parents[1].title} list={siblingsData[0]} className="mb-3 w-full" path="/base-de-connaissance" isOpen={router.query.openTheme === item.slug} slug={item.slug} />
              <ol>
                  <li key={item._id} className="mb-2 flex border-b border-t border-gray-200 py-1.5 pr-2">
                    <Link href={`/base-de-connaissance/${item.parents[1].slug}`} className="flex flex-row text-center justify-start align-center border-gray-200 px-2 py-1.5">
                      <HiChevronLeft className="text-[20px] text-gray-400" />
                      <p className="ml-2 border-l pl-4 text-[12px] font-medium uppercase"> {item.parents[1].title}</p>
                    </Link>
                  </li>
                  {Array.isArray(siblingsData) &&
                    siblingsData.length > 0 &&
                    siblingsData[0].map(
                      ({ _id, slug, title, type, status }) =>
                        type === "article" &&
                        status === "PUBLISHED" && (
                          <li key={_id} className={`flex flex-nowrap items-center gap-1 ${_id === item._id ? "bg-gray-200" : ""}`}>
                            <Link href={`/base-de-connaissance/${slug}`} className="rounded px-2 py-1.5 text-[12px]" onClick={() => cache.clear()}>
                              {title}
                            </Link>
                          </li>
                        )
                    )}
              </ol> */}
            </div>
          )}
          <div className={item.parents.length > 2 ? "max-w-[700px]" : ""}>
            <div className="flew-row flex justify-between pb-2 pt-4">
              <div className="mr-4">
                <h2 className="mb-2 text-[24px] font-bold print:mb-0 print:text-black">{group?.title}</h2>
                <h1 className="mb-2 text-[24px] font-bold md:text-[30px] print:mb-0 print:text-black">{item?.title}</h1>
                <h6 className="text-[18px] text-snu-purple-100 md:text-[18px] lg:text-xl print:text-black">{item?.description}</h6>
              </div>
              <div>
                {item?.updatedAt && (
                  <span className="mb-4 ml-auto mt-2 flex flex-col items-end text-xs italic text-gray-400 print:mb-2 print:mt-0">
                    {/* <em>Article mis à jour le {Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(item.updatedAt))}</em> */}
                    <button
                      className="noprint mt-2 hidden cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-3 font-normal text-black shadow-none md:block"
                      onClick={window.print}
                    >
                      <div className="flex justify-center">
                        <HiPrinter className="w-[20px] text-[20px] text-[#374151]" />
                      </div>
                    </button>
                  </span>
                )}
              </div>
            </div>
            <hr className="mb-6 mt-4" />
            <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
            <ToastContainer />
            <FeedbackComponent item={item} />
            <hr className="mb-6 mt-4" />
            <KnowledgeBasePublicNoAnswer />
          </div>
        </div>
      </section>
    </div>
  );
};

const ArticleLoader = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100 p-4 print:bg-transparent">
    <div className="relative mb-5  mt-16 h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-16  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-16  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
  </div>
);

export default KnowledgeBasePublicArticle;
