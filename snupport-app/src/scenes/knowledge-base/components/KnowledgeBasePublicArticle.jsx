import React from "react";
import TextEditor from "./TextEditor";

const KnowledgeBasePublicArticle = ({ item, isLoading }) => {
  if (isLoading) return <ArticleLoader />;
  return (
    <div className="wrapper mx-auto flex w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100 print:bg-transparent  print:pb-12">
      {item?.updatedAt && (
        <span className="ml-auto mt-2 mb-4 flex flex-col items-end text-xs italic text-gray-400 print:mt-0 print:mb-2">
          <em>Article mis à jour le {Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(item.updatedAt))}</em>
          <button className="noprint mt-2 cursor-pointer border border-gray-300 bg-gray-100 font-normal text-black shadow-none" onClick={window.print}>
            🖨 Imprimer
          </button>
        </span>
      )}
      <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
    </div>
  );
};

const ArticleLoader = () => (
  <div className="wrapper mx-auto flex w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100 print:bg-transparent">
    <div className="relative mt-16  mb-5 h-2 w-full bg-gray-200">
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
