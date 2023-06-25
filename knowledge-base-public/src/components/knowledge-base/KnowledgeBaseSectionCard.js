import Link from "next/link";
import BlueIcon from "../BlueIcon";
import React from "react";

const KnowledgeBaseSectionCard = ({ _id, position, title, icon, slug, children = [], path, isRoot, className }) => {
  return (
    <article data-position={position} data-id={_id} className={`flex w-72 flex-col items-start overflow-hidden rounded-lg bg-white shadow-lg ${className}`}>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-4 flex h-[48px] flex-grow-0 items-center">
          {icon && <BlueIcon icon={icon} className="mr-4" />}
          <span className="font-bold text-gray-900">{title}</span>
        </h3>
        <ul className="flex-1">
          {children.map(({ title, type, slug }) => (
            <li className=" border-t border-gray-200 ">
              <Link aria-label={title} className="flex items-center py-4" key={_id} href={`${path}/${slug}${path === "/base-de-connaissance" ? "?loadingType=section" : ""}`}>
                {type === "section" && (
                  <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E3E3FD]">
                    <span className="material-icons text-xs font-semibold text-[#000091]">folder_open</span>
                  </span>
                )}

                <h4 className="mr-2 flex-1 text-sm">{title}</h4>
                <span className="material-icons text-gray-400">keyboard_arrow_right</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <footer className="flex w-full">
        <Link
          aria-label={`Voir toute la thématique ${title}`}
          className="h-[52px] w-full justify-start bg-gray-50 p-4 text-sm font-medium text-blue-600"
          key={_id}
          href={`${path}/${slug}${path === "/base-de-connaissance" ? "?loadingType=section" : ""}`}
        >
          Voir toute la thématique
        </Link>
      </footer>
    </article>
  );
};

export default KnowledgeBaseSectionCard;
