import React from "react";
import { Link } from "react-router-dom";
import { BlueIcon } from "./IconsPicker";
import Tags from "./Tags";
import { forSearch } from "./../utils/material-icons";
import { sortAndRenderTitles, contentSummary } from "./../utils/knowledgeBaseTree";

const tiltesAndSection = (sectionChildren) => {
  const sortedItems = sortAndRenderTitles(sectionChildren);

  return sortedItems.map((item) => {
    const { type, title, slug, id, position } = item;
    const icon = type === "section" ? forSearch.find((icon) => icon.icon === "folder") : null;
    return (
      <React.Fragment key={id}>
        <hr className="mt-1 border-b-1 text-white opacity-50 mx-4" />
        <Link to={`/knowledge-base/${slug}`} data-position={position} data-id={id} className={`px-2 py-4 flex w-72 min-w-1/4 flex-shrink-0 flex-grow-0 cursor-pointer`}>
          <div className="flex items-center justify-between w-full">
            {icon && (
              <div className="flex items-center ml-4">
                <span className="material-icons flex h-6 w-6 items-center justify-center rounded-2xl bg-snu-purple-100 text-center text-lg text-snu-purple-700">{icon.icon}</span>
              </div>
            )}
            <div className="flex flex-col flex-grow">
              <p className="pr-4 ml-4 text-[14px] text-black">{title}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-6 h-4 w-4 shrink-0 grow-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </React.Fragment>
    );
  });
};

const KnowledgeBaseSectionCardV2 = ({ _id, position, title, group, icon, slug, allowedRoles, sectionChildren, isRoot }) => {
  const cardContent = (
    <div className="flex flex-grow flex-col overflow-hidden rounded-lg bg-white shadow-lg">
      <header className={`${isRoot ? "pt-6" : "py-10"} flex flex-row items-start px-4 leading-tight`}>
        {isRoot && (
          <div className="flex items-center">
            <BlueIcon icon={icon} showText={false} className="!m-0" style={{ width: "24px", height: "24px" }} />
          </div>
        )}
        <div className="flex flex-col ml-2 mb-2">
          {!!group && <h4 className="mb-2 text-left text-sm font-bold uppercase text-red-500">{group}</h4>}
          <h3 className="my-0 text-[16px] font-bold text-black">{title}</h3>
          {!!sectionChildren && <p className="mb-2 text-coolGray-500">{contentSummary(sectionChildren)}</p>}
          {allowedRoles?.length && (
            <div className="flex flex-wrap">
              <Tags tags={allowedRoles} />
            </div>
          )}
        </div>
      </header>
      {isRoot && <div className="flex-grow">{!!sectionChildren && <div>{tiltesAndSection(sectionChildren)}</div>}</div>}
      {isRoot && (
        <React.Fragment>
          <hr className="mt-4 border-b-1 text-[#E5E5E5]" />
          <footer className="flex items-end bg-gray-50">
            <Link key={_id} to={`/knowledge-base/${slug}`} data-position={position} data-id={_id} className="cursor-pointer">
              <p className="text-[14px] text-[#2563EB] pt-3 pb-3 ml-4">Voir tout</p>
            </Link>
          </footer>
        </React.Fragment>
      )}
    </div>
  );

  return isRoot ? (
    <div className="mx-2 my-4 flex w-72 min-w-1/4 flex-shrink grow-0">{cardContent}</div>
  ) : (
    <Link key={_id} to={`/knowledge-base/${slug}`} data-position={position} data-id={_id} className="mx-2 my-4 flex w-72 min-w-1/4 flex-shrink grow-0 cursor-pointer">
      {cardContent}
    </Link>
  );
};

export default KnowledgeBaseSectionCardV2;
