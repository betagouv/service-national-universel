import dayjs from "dayjs";
import { SUPPORT_ROLES_READABLE } from "snu-lib/roles";
import Link from "next/link";

const KnowledgeBaseCard = ({ imageSrc, imageAlt, title, date, author, slug, tags = [] }) => {
  return (
    <Link href={`/admin/knowledge-base/${slug}`} passHref>
      <a href="#" className="my-1 px-1 w-80 flex-shrink-0 flex-grow-0 lg:my-4 lg:px-4">
        <article className="overflow-hidden rounded-lg shadow-lg">
          <div className="h-56 w-full bg-gray-300 flex items-center justify-center">
            {!!imageSrc ? <img alt={imageAlt} className="block h-auto w-full" src={imageSrc} /> : <span className="text-gray-400">Pas d'image</span>}
          </div>
          <header className="flex items-center justify-between leading-tight p-2 md:p-4">
            <h3 className="text-lg text-black">{title}</h3>
            <p className="text-grey-darker text-sm">{dayjs(date).format("DD/MM/YY")}</p>
          </header>

          <footer className="flex flex-col items-start justify-between leading-none p-2 md:p-4">
            <p className="flex items-center no-underline hover:underline text-black">
              <span className="ml-2 text-sm">
                Par {author.firstName} {author.lastName}
              </span>
            </p>
            <p className="flex flex-wrap mt-3.5">
              {tags
                .filter((tag) => (tags.includes("all") ? tag === "all" : true))
                .map((tag) => (
                  <span className="bg-gray-200 px-2 py-0.5 rounded-xl ml-2 text-xs" key={tag}>
                    {SUPPORT_ROLES_READABLE[tag]}
                  </span>
                ))}
            </p>
          </footer>
        </article>
      </a>
    </Link>
  );
};

export default KnowledgeBaseCard;
