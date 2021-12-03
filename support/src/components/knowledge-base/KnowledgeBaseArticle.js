import { useState } from "react";
import Tags from "../Tags";
import TextEditor from "../TextEditor";

const KnowledgeBaseArticle = ({ article }) => {
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  return (
    <div className="container bg-coolGray-100  mx-auto flex flex-col px-8 pt-3 flex-grow flex-shrink overflow-hidden w-full">
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
      <TextEditor
        key={article._id + article.slug}
        content={article.content}
        _id={article._id}
        slug={article.slug}
        forceUpdateKey={forceUpdateKey}
        setForceUpdateKey={setForceUpdateKey}
      />
    </div>
  );
};

export default KnowledgeBaseArticle;
