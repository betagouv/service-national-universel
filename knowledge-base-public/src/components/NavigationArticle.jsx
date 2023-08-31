import React, { useRef, useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import API from "../services/api";
import { useRouter } from "next/router";
import Link from "next/link";
import slugify from "slugify";
import FolderIcon from "./FolderIcon";
import { HiChevronLeft } from "react-icons/hi";
import useUser from "../hooks/useUser";
import { useMediaQuery } from "../hooks/useMediaQuery";

// accessibility: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/

const NavigationArticle = ({ item }) => {
  const { restriction } = useUser();
  const router = useRouter();
  const { cache } = useSWRConfig();
  const parentId = item.parentId;
  const [siblingsData, setSiblingsData] = useState([]); // État pour stocker les données des frères et sœurs
  const title = item.parents[1].title;
  const list = siblingsData;
  const path = "/base-de-connaissance";
  const isOpen = router.query.openTheme === item.slug;

  const [active, setActive] = useState(false);
  const [height, setHeight] = useState("0px");
  const [rotate, setRotate] = useState("transform duration-700 ease");

  const element = useRef(null);
  const contentSpace = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 768px)"); //md

  useEffect(() => {
    const fetchSiblings = async () => {
      try {
        const response = await API.post({ path: `/knowledge-base/${restriction}/siblings`, body: { parentId } });
        setSiblingsData(response.siblings);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSiblings();
  }, [item]);

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
    <>
      <Link href={`/base-de-connaissance/${item.parents[0].slug}`} className=" align-center mb-2 flex flex-row justify-start text-center md:hidden">
        <HiChevronLeft className="h-[23px] text-center text-[20px] text-gray-500" />
        <p className="text-sm leading-5 text-gray-500">Retour</p>
      </Link>
      <div
        ref={element}
        className={`flex flex-col justify-start overflow-hidden rounded-md rounded-md border-[1px] bg-white shadow-md md:rounded-none md:rounded-none md:border-none md:shadow-none`}
      >
        <h3 className="flex md:border-b md:border-t">
          <button
            id={slugify(title)}
            aria-controls={`${slugify(title)}_items`}
            aria-expanded={active}
            className={`flex w-full flex-1 cursor-pointer appearance-none flex-row items-center justify-center md:justify-between md:rounded-md md:border-none ${
              active ? "bg-white md:bg-white" : "bg-gray-100 md:bg-white"
            } py-4 shadow-none md:py-[0.5rem] md:pr-[2rem]`}
            onClick={toggleAccordion}
          >
            <Link href={`/base-de-connaissance/${item.parents[0].slug}`} className="align-center flex hidden flex-row justify-between text-center md:mr-2 md:block">
              <HiChevronLeft className="h-[23px] text-center text-[20px] text-gray-400 md:mr-4 md:border-r md:border-gray-200" />
            </Link>
            <div className="mr-2 flex flex-col justify-center">
              <span className="line-clamp-2 flex-1 text-center text-sm font-medium text-gray-500 md:hidden">Articles liés</span>
              <span className="line-clamp-2 flex-1 text-center text-xs font-medium uppercase leading-4 tracking-wider text-gray-900">{title}</span>
            </div>
            <span className={`${rotate} material-icons text-gray-400 md:hidden`}>expand_more</span>
            <span className={`text-gray-400`}></span>
          </button>
        </h3>

        <div
          id={`${slugify(title)}_items`}
          aria-labelledby={slugify(title)}
          ref={contentSpace}
          style={{ ...(isDesktop ? {} : { maxHeight: `${height}` }) }}
          className="transition-max-height overflow-auto duration-700 ease-in-out"
        >
          {list && list.length > 0 ? (
            <ul>
              {list
                .slice()
                .sort((a, b) => a.position - b.position)
                .map(({ _id, title, slug, type }, index) => (
                  <li
                    className={`flex border-gray-200 text-sm font-medium leading-5 text-gray-600 ${
                      _id === item._id ? "rounded-md bg-gray-200 text-gray-900" : "text-gray-600"
                    }`}
                    key={_id}
                  >
                    <Link
                      tabIndex={active ? 0 : -1}
                      className="flex flex-1 items-center px-6 py-4"
                      href={`${path}/${type === "section" ? slugTheme : slug}${type === "section" ? `?loadingType=section&openTheme=${slug}` : ""}`}
                    >
                      {type === "section" && <FolderIcon />}
                      <span className="line-clamp-2">{title}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="px-6 pb-4 text-sm font-medium text-gray-400">Articles en cours de rédaction ⏳</div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavigationArticle;
