import { SUPPORT_ROLES } from "snu-lib/roles";
import { filterTags } from "../../utils/tags";
import TextEditor from "../TextEditor";
import KnowledgeBaseEdit from "./KnowledgeBaseEdit";

const KnowledgeBaseAnswer = ({ answer }) => {
  return (
    <div className="flex flex-col px-8 py-3 flex-grow flex-shrink overflow-hidden w-full">
      <div className="flex justify-between">
        <div>
          <h2 className="font-bold text-lg">{answer.title}</h2>
          {!!answer.description?.length && <p className="mt-1 text-sm italic">{answer.description}</p>}
          {!!answer.allowedRoles?.length && (
            <p className="flex flex-wrap mt-3.5  text-sm">
              Visible par:
              {answer.allowedRoles.filter(filterTags).map((tag) => (
                <span className="bg-gray-200 px-2 py-0.5 rounded-xl ml-2 mb-2 text-xs" key={tag}>
                  {SUPPORT_ROLES[tag]}
                </span>
              ))}
            </p>
          )}
        </div>
        <KnowledgeBaseEdit key={answer.slug} sectionOrAnswer={answer} />
      </div>
      <TextEditor content={answer.content} _id={answer._id} slug={answer.slug} />
    </div>
  );
};

export default KnowledgeBaseAnswer;
