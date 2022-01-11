import TextEditor from "../TextEditor";

const KnowledgeBasePublicArticle = ({ item, isLoading }) => {
  if (isLoading) return <ArticleLoader />;
  return (
    <div className="wrapper bg-coolGray-100  mx-auto flex flex-col flex-grow flex-shrink overflow-hidden w-full">
      {item?.updatedAt && (
        <span className="ml-auto text-xs text-gray-400 mt-2 mb-4">
          <em>Article mis à jour le {Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(item.updatedAt))}</em>
        </span>
      )}
      <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
    </div>
  );
};

const ArticleLoader = () => (
  <div className="wrapper bg-coolGray-100  mx-auto flex flex-col flex-grow flex-shrink overflow-hidden w-full">
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
