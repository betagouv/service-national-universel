import getTitleWithStatus from "../../utils/getTitleWithStatus";
import Tags from "../Tags";
import TextEditor from "../TextEditor";
import KnowledgeBaseEdit from "./KnowledgeBaseEdit";

const KnowledgeBaseAnswer = ({ article }) => {
  return (
    <div className="container flex flex-col px-8 pt-3 flex-grow flex-shrink overflow-hidden w-full">
      <div className="flex justify-between">
        <div>
          <h2 className="font-bold text-lg">{getTitleWithStatus(article)}</h2>
          {!!article.description?.length && <p className="mt-1 text-sm italic">{article.description}</p>}
          {!!article.allowedRoles?.length && (
            <p className="flex flex-wrap mt-3.5  text-sm">
              Visible par:
              <Tags tags={article.allowedRoles} />
            </p>
          )}
        </div>
        <KnowledgeBaseEdit key={article.slug} sectionOrAnswer={article} />
      </div>
      <TextEditor key={article._id + article.slug} content={article.content} _id={article._id} slug={article.slug} />
    </div>
  );
};

export default KnowledgeBaseAnswer;
