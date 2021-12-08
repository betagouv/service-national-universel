import Link from "next/link";
import { RedIcon } from "../IconsPicker";
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

const KnowledgeBaseCardSection = ({ _id, imageSrc, position, title, group, icon, slug, allowedRoles, sectionChildren }) => {
  return (
    <Link key={_id} href={`/admin/knowledge-base/${slug}`} passHref>
      <a href="#" data-position={position} data-id={_id} className="my-1 w-full flex-shrink-0 flex-grow-0 lg:my-4 ">
        <article className="overflow-hidden rounded-lg shadow-lg bg-white">
          {!!imageSrc ? (
            <div className="h-40 w-full bg-gray-300 flex items-center justify-center overflow-hidden">
              <img alt={title.title} className="relative h-40 w-full bg-gray-300 flex-shrink-0 object-contain" src={imageSrc} />
            </div>
          ) : !!icon ? (
            <div className="w-full flex items-center overflow-hidden px-8 pt-8">
              <RedIcon icon={icon} showText={false} className="!m-0" />
            </div>
          ) : (
            <div className="h-40 w-full bg-gray-300 flex items-center justify-center overflow-hidden">
              <span className="text-gray-400">Pas d'image</span>
            </div>
          )}
          <header className="flex flex-col items-start justify-start leading-tight mt-4 mb-2 px-8 ">
            {!!group && <h4 className="text-sm text-red-500 font-bold uppercase text-left mb-2">{group}</h4>}
            <h3 className="text-xl text-black font-bold">{title}</h3>
          </header>
          <p className="flex flex-wrap text-coolGray-500 px-8  mb-2">{contentSummary(sectionChildren)}</p>
          <footer className="flex flex-col items-start justify-between leading-none px-8 mb-4 -ml-2">
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
