import Link from "next/link";
import Tags from "../Tags";

const KnowledgeBaseCardAnswer = ({ _id, position, title, createdAt, author, slug, allowedRoles = [] }) => {
  return (
    <Link key={_id} href={`/admin/knowledge-base/${slug}`} passHref>
      <a href="#" data-position={position} data-id={_id} className="my-1 px-1 w-full flex-shrink-0 flex-grow-0 lg:my-4 lg:px-4 ">
        <article className="flex items-center overflow-hidden rounded-lg shadow-lg bg-white py-3">
          <div className="flex flex-col flex-grow">
            <header className="flex items-center justify-between leading-tight px-8">
              <h3 className="text-lg text-black">{title}</h3>
            </header>

            <footer className="flex flex-col items-start justify-between leading-none px-8 mt-2.5">
              <p className="flex flex-wrap">
                <Tags tags={allowedRoles} />
              </p>
            </footer>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0 h-4 w-4 mr-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </article>
      </a>
    </Link>
  );
};

export default KnowledgeBaseCardAnswer;
