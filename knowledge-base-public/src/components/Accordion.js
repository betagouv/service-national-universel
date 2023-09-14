import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import slugify from "slugify";
import FolderIcon from "./FolderIcon";
import { separateEmojiAndText } from "../utils/index";
// accessibility: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/

export const Accordion = ({ title, list = [], className = "", path, isOpen = false, slug: slugTheme }) => {
  const [active, setActive] = useState(false);
  const [height, setHeight] = useState("0px");
  const [rotate, setRotate] = useState("transform duration-700 ease");

  const element = useRef(null);
  const contentSpace = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        element?.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
      setTimeout(() => {
        toggleAccordion();
      }, 1000);
    }
  }, [isOpen]);

  function toggleAccordion() {
    setActive((prevState) => !prevState);
    setHeight(active ? "0px" : `${contentSpace?.current?.scrollHeight}px`);
    setRotate(active ? "transform duration-700 ease" : "transform duration-700 ease rotate-180");
  }

  return (
    <div ref={element} className={`flex w-full max-w-[690px] flex-col overflow-hidden rounded-lg bg-white shadow-md ${className}`}>
      <h3 className="flex">
        <button
          id={slugify(title)}
          aria-controls={`${slugify(title)}_items`}
          aria-expanded={active}
          className="flex h-[60px] flex-1 cursor-pointer appearance-none items-center rounded-none border-none bg-white px-4 shadow-none"
          onClick={toggleAccordion}
        >
          <span className="line-clamp-2 flex-1 text-left text-base font-semibold text-gray-900">{title}</span>
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
        {list && list.length > 0 ? (
          <ul>
            {list.map(({ title, slug, type }, index) => {
              const [emoji, text] = separateEmojiAndText(title);
              return (
                <li className="flex border-t border-gray-200 text-sm font-medium text-gray-900" key={index}>
                  <Link
                    tabIndex={active ? 0 : -1}
                    className="flex flex-1 items-center px-6 py-4"
                    href={`${path}/${type === "section" ? slugTheme : slug}${type === "section" ? `?loadingType=section&openTheme=${slug}` : ""}`}
                  >
                    {type === "section" && <FolderIcon />}
                    {emoji}
                    <span className="line-clamp-2">{text}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-6 pb-4 text-sm font-medium text-gray-400">Articles en cours de rédaction ⏳</div>
        )}
      </div>
    </div>
  );
};
