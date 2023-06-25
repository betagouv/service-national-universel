import React, { useRef, useState } from "react";
import Link from "next/link";
import slugify from "slugify";

// accessibility: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/

export const Accordion = ({ title, list = [], className = "", path }) => {
  const [active, setActive] = useState(false);
  const [height, setHeight] = useState("0px");
  const [rotate, setRotate] = useState("transform duration-700 ease");

  const contentSpace = useRef(null);

  function toggleAccordion() {
    setActive((prevState) => !prevState);
    setHeight(active ? "0px" : `${contentSpace?.current?.scrollHeight}px`);
    setRotate(active ? "transform duration-700 ease" : "transform duration-700 ease rotate-180");
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-lg bg-white ${className}`}>
      <h3 className="flex">
        <button
          id={slugify(title)}
          aria-controls={`${slugify(title)}_items`}
          aria-expanded={active}
          className="flex h-[60px] flex-1 cursor-pointer appearance-none items-center rounded-none border-none bg-white px-4 shadow-none"
          onClick={toggleAccordion}
        >
          <span className="flex-1 text-left text-sm font-bold text-gray-900">{title}</span>
          <span className={`${rotate} material-icons text-gray-400`}>expand_more</span>
        </button>
      </h3>

      <div
        id={`${slugify(title)}_items`}
        aria-labelledby={slugify(title)}
        ref={contentSpace}
        style={{ maxHeight: `${height}` }}
        className="transition-max-height overflow-auto duration-700 ease-in-out"
      >
        <ul>
          {list.map(({ title, slug }, index) => (
            <li className="flex border-t border-gray-200 text-sm font-medium text-gray-900" key={index}>
              <Link tabIndex={active ? 0 : -1} className="flex-1 px-6 py-4" href={`${path}/${slug}${path === "/base-de-connaissance" ? "?loadingType=section" : ""}`}>
                {title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
