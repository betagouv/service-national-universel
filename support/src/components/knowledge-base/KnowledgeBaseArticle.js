import { toast } from "react-toastify";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";
import API from "../../services/api";
import Tags from "../Tags";
import TextEditor from "../TextEditor";

const KnowledgeBaseArticle = ({ article, readOnly = false }) => {
  const { mutate } = useKnowledgeBaseData();

  const onSave = async (content) => {
    const response = await API.put({ path: `/support-center/knowledge-base/${article._id}`, body: { content } });
    if (!response.ok) {
      if (response.error) return toast.error(response.error);
      return false;
    }
    toast.success("Article mis-à-jour !");
    mutate();
    return true;
  };

  return (
    <div className="container bg-coolGray-100  mx-auto flex flex-col px-8 pt-3 flex-grow flex-shrink overflow-hidden w-full">
      {!readOnly && (
        <header className="flex flex-col">
          <h2 className="font-bold text-lg">{article.title}</h2>
          {!!article.description?.length && <p className="mt-1 text-sm italic">{article.description}</p>}
          {!!article.allowedRoles?.length && (
            <p className="flex flex-wrap mt-3.5  text-sm">
              Visible par:
              <Tags tags={article.allowedRoles} />
            </p>
          )}
        </header>
      )}
      <TextEditor readOnly={readOnly} key={article._id + article.slug} content={article.content} _id={article._id} slug={article.slug} onSave={onSave} />
    </div>
  );
};

export default KnowledgeBaseArticle;
