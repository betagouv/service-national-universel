import React from "react";
import { Link } from "react-router-dom";
import Tags from "./Tags";

const KnowledgeBaseArticleCard = ({ _id, position, title, slug, allowedRoles = [], className = "", contentClassName = "" }) => {
  return (
    <Link key={_id} to={`/knowledge-base/${slug}`} data-position={position} data-id={_id} className={`my-1 w-full shrink-0 grow-0 cursor-pointer lg:my-4 ${className}`}>
      <article className={`flex items-center overflow-hidden rounded-lg bg-white py-6 shadow-lg ${contentClassName}`}>
        <div className="flex flex-grow flex-col">
          <header className="flex items-center justify-between px-8 leading-tight">
            <h3 className="my-0 text-lg text-black">{title}</h3>
          </header>

          {!!allowedRoles.length && (
            <footer className="mt-2.5 flex flex-col items-start justify-between px-8 leading-none">
              <p className="flex flex-wrap">
                <Tags tags={allowedRoles} />
              </p>
            </footer>
          )}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-6 h-4 w-4 shrink-0 grow-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </article>
    </Link>
  );
};

export default KnowledgeBaseArticleCard;
