import Link from "next/link";
import RedIcon from "../RedIcon";

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

const KnowledgeBaseSectionCard = ({ _id, imageSrc, position, title, group, icon, slug, sectionChildren, path, isRoot }) => {
  return (
    <Link legacyBehavior key={_id} href={`${path}/${slug}${path === "/base-de-connaissance" ? "?loadingType=section" : ""}`} passHref>
      <a href="#" data-position={position} data-id={_id} className="mx-2 my-4 flex w-72 min-w-1/4 flex-shrink grow-0">
        <article className="flex flex-grow flex-col overflow-hidden rounded-lg bg-white shadow-lg">
          {!!imageSrc ? (
            <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden bg-gray-300">
              <img alt={title.title} className="relative h-32 w-full shrink-0 bg-gray-300 object-cover" src={imageSrc} />
            </div>
          ) : !!icon ? (
            <div className="flex w-full items-center overflow-hidden px-8 pt-8">
              <RedIcon icon={icon} showText={false} className="!m-0" />
            </div>
          ) : (
            <div className="flex h-32 w-full items-center justify-center overflow-hidden bg-gray-300">
              <span className="text-gray-400">Pas d'image</span>
            </div>
          )}
          <header className="mb-2 mt-2 flex flex-col items-start justify-start px-8 pt-6 pb-8 leading-tight">
            {!!group && <h4 className="mb-2 text-left text-sm font-bold uppercase text-red-500">{group}</h4>}
            <h3 className="text-xl font-bold text-black">{title}</h3>
          </header>
          {!!isRoot && <div className="spacer h-32 shrink-0 flex-grow" />}
          {!!sectionChildren && <p className="mb-2 flex flex-wrap px-8  text-coolGray-500">{contentSummary(sectionChildren)}</p>}
        </article>
      </a>
    </Link>
  );
};

export default KnowledgeBaseSectionCard;
