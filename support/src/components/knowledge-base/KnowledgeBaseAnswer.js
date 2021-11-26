import getTitleWithStatus from "../../utils/getTitleWithStatus";
import Tags from "../Tags";
import TextEditor from "../TextEditor";
import KnowledgeBaseEdit from "./KnowledgeBaseEdit";

const KnowledgeBaseAnswer = ({ answer }) => {
  return (
    <div className="container flex flex-col px-8 pt-3 flex-grow flex-shrink overflow-hidden w-full">
      <div className="flex justify-between">
        <div>
          <h2 className="font-bold text-lg">{getTitleWithStatus(answer)}</h2>
          {!!answer.description?.length && <p className="mt-1 text-sm italic">{answer.description}</p>}
          {!!answer.allowedRoles?.length && (
            <p className="flex flex-wrap mt-3.5  text-sm">
              Visible par:
              <Tags tags={answer.allowedRoles} />
            </p>
          )}
        </div>
        <KnowledgeBaseEdit key={answer.slug} sectionOrAnswer={answer} />
      </div>
      <TextEditor key={answer._id + answer.slug} content={answer.content} _id={answer._id} slug={answer.slug} />
    </div>
  );
};

export default KnowledgeBaseAnswer;
