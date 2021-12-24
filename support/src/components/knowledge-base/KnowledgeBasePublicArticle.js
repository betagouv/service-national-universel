import TextEditor from "../TextEditor";

const KnowledgeBasePublicArticle = ({ item }) => {
  return (
    <div className="wrapper bg-coolGray-100  mx-auto flex flex-col flex-grow flex-shrink overflow-hidden w-full">
      <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
    </div>
  );
};

export default KnowledgeBasePublicArticle;
