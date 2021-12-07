import Link from "next/link";
import Tags from "../Tags";

const contentSummary = (sectionChildren) => {
  const answers = sectionChildren.filter((child) => child.type === "article");
  const sections = sectionChildren.filter((child) => child.type === "section");
  if (!answers.length && !sections.length) return "Pas de contenu";
  const sectionsSummary = `${sections.length} sous-rubrique${sections.length > 1 ? "s" : ""}`;
  const answersSummary = `${answers.length} article${answers.length > 1 ? "s" : ""}`;
  if (!answers.length) return sectionsSummary;
  if (!sections.length) return answersSummary;
  return `${answersSummary} \u00A0\u2022\u00A0 ${sectionsSummary}`;
};

const KnowledgeBaseCardSection = ({ _id, imageSrc, position, imageAlt, title, slug, allowedRoles, sectionChildren }) => {
  return (
    <Link key={_id} href={`/admin/knowledge-base/${slug}`} passHref>
      <a href="#" data-position={position} data-id={_id} className="my-1 px-1 w-full flex-shrink-0 flex-grow-0 lg:my-4 lg:px-4 ">
        <article className="overflow-hidden rounded-lg shadow-lg bg-white">
          <div className="h-40 w-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {!!imageSrc ? <img alt={imageAlt} className="block h-auto w-full" src={imageSrc} /> : <span className="text-gray-400">Pas d'image</span>}
          </div>
          <header className="flex items-center justify-between leading-tight p-2 md:p-4">
            <h3 className="text-lg text-black">{title}</h3>
          </header>
          <p className="px-2 md:px-4  flex flex-wrap text-coolGray-500">{contentSummary(sectionChildren)}</p>
          <footer className="flex flex-col items-start justify-between leading-none p-2 md:p-4 ">
            <p className="flex flex-wrap">
              <Tags tags={allowedRoles} />
            </p>
          </footer>
        </article>
      </a>
    </Link>
  );
};

export default KnowledgeBaseCardSection;
