import TextEditor from "../TextEditor";
import { useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import Breadcrumbs from "../breadcrumbs";
import FeedbackComponent from "../FeedBack";
import NavigationArticle from "../NavigationArticle";
import { HiPrinter } from "react-icons/hi";

const KnowledgeBasePublicArticle = ({ item, isLoading }) => {
  const group = useMemo(() => {
    return item?.group || item?.parents?.[0]?.group;
  }, [item]);

  if (!item || isLoading) return <ArticleLoader />;
  return (
    <div className="w-full bg-white">
      <section className="mx-auto flex max-w-[950px] flex-shrink flex-grow flex-col overflow-hidden px-4 text-gray-800 print:bg-transparent print:pb-12">
        <Breadcrumbs parents={item?.parents || []} path="/base-de-connaissance" />
        <div className={`align-center flex flex-col ${item.parents.length > 2 ? "md:flex-row" : ""}`}>
          {item.parents.length > 2 && (
            <div className="mt-4 w-full md:mr-12 md:max-w-[30%]">
              <NavigationArticle item={item} />
            </div>
          )}
          <div className={item.parents.length > 2 ? "max-w-[70%]" : ""}>
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
