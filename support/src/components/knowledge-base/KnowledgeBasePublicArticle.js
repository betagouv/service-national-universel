import TextEditor from "../TextEditor";

const KnowledgeBasePublicArticle = ({ item, isLoading }) => {
  if (isLoading) return <ArticleLoader />;
  return (
    <div className="wrapper bg-coolGray-100 print:bg-transparent mx-auto flex flex-col flex-grow flex-shrink overflow-hidden w-full  print:pb-12">
      {item?.updatedAt && (
        <span className="ml-auto text-xs text-gray-400 mt-2 mb-4 print:mt-0 print:mb-2 italic flex flex-col items-end">
          <em>Article mis à jour le {Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(item.updatedAt))}</em>
          <em className="cursor-pointer noprint" onClick={window.print}>
            🖨 Imprimer
          </em>
        </span>
      )}
      <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
    </div>
  );
};

const ArticleLoader = () => (
  <div className="wrapper bg-coolGray-100 print:bg-transparent mx-auto flex flex-col flex-grow flex-shrink overflow-hidden w-full">
    <div className="h-2 relative  bg-gray-200 w-full mt-16 mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-16">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-16">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
    <div className="h-2 relative  bg-gray-200 w-full mb-5">
      <div className="animated-background" />
    </div>
  </div>
);

export default KnowledgeBasePublicArticle;
