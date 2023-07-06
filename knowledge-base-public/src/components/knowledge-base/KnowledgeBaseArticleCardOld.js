import Link from "next/link";

const KnowledgeBaseArticleCard = ({ _id, position, title, slug, path, className = "", contentClassName = "" }) => {
  return (
    <Link legacyBehavior key={_id} href={`${path}/${slug}${path === "/base-de-connaissance" ? "?loadingType=article" : ""}`} passHref>
      <a href="#" data-position={position} data-id={_id} className={`my-1 w-full shrink-0 grow-0 lg:my-4 ${className}`}>
        <article className={`flex items-center overflow-hidden rounded-lg bg-white py-6 shadow-lg ${contentClassName}`}>
          <div className="flex flex-grow flex-col">
            <header className="flex items-center justify-between px-8 leading-tight">
              <h3 className="text-lg text-black">{title}</h3>
            </header>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-6 h-4 w-4 shrink-0 grow-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </article>
      </a>
    </Link>
  );
};

export default KnowledgeBaseArticleCard;
