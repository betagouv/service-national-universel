import React, { useRef, useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import API from "../services/api";
import { useRouter } from "next/router";
import Link from "next/link";
import slugify from "slugify";
import FolderIcon from "./FolderIcon";
import { HiChevronLeft } from "react-icons/hi";
import useUser from "../hooks/useUser";

// accessibility: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/

const NavigationArticle = ({ item, device }) => {
  const { restriction } = useUser();
  const router = useRouter();
  const { cache } = useSWRConfig();
  const parentId = item.parentId;
  const [siblingsData, setSiblingsData] = useState([]); // État pour stocker les données des frères et sœurs

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

  const Accordion = ({ title, list = [], className = "", path, isOpen = false, slug: slugTheme }) => {
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
      <>
        <div ref={element} className={`flex w-full max-w-[690px] flex-col justify-start overflow-hidden rounded-md bg-white shadow-md ${className}`}>
          <h3 className="flex">
            <button
              id={slugify(title)}
              aria-controls={`${slugify(title)}_items`}
              aria-expanded={active}
              className={`flex flex-1 cursor-pointer appearance-none flex-row items-center justify-between rounded-none border-none md:justify-center ${
                active ? "bg-white" : "bg-gray-100"
              } px-4 py-4 shadow-none`}
              onClick={toggleAccordion}
            >
              <Link href={`/base-de-connaissance/${item.parents[1].slug}`} className="align-center flex flex-row justify-center text-center md:mr-2" onClick={() => cache.clear()}>
                <HiChevronLeft className="h-[23px] text-center text-[20px] text-gray-500" />
                <p className="hidden text-sm leading-5 text-gray-500">Retour</p>
              </Link>
              <div className="mr-2 flex flex-col justify-center">
                <span className="line-clamp-2 flex-1 text-center text-sm font-medium text-gray-500 md:hidden">Articles liés</span>
                <span className="line-clamp-2 flex-1 text-center text-sm font-medium text-gray-900">{title}</span>
              </div>
              <span className={`${rotate} material-icons text-gray-400 md:hidden`}>expand_more</span>
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
                {list.map(({ _id, title, slug, type }, index) => (
                  <li
                    className={`flex border-gray-200 text-sm font-medium text-gray-900 ${_id === item._id ? "rounded-md bg-gray-200 text-gray-900" : "text-gray-500"}`}
                    key={index}
                  >
                    <Link
                      tabIndex={active ? 0 : -1}
                      className="flex flex-1 items-center px-6 py-4"
                      href={`${path}/${type === "section" ? slugTheme : slug}${type === "section" ? `?loadingType=section&openTheme=${slug}` : ""}`}
                      onClick={() => cache.clear()}
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

  const NavigationDesktop = ({ item, siblingsData }) => {
    return (
      <ol>
        <li key={item._id} className="mb-2 flex border-b border-t border-gray-200 py-1.5 pr-2">
          <Link href={`/base-de-connaissance/${item.parents[1].slug}`} className="align-center flex flex-row justify-start border-gray-200 px-2 py-1.5 text-center">
            <HiChevronLeft className="text-[20px] text-gray-400" />
            <p className="ml-2 border-l pl-4 text-[12px] font-medium uppercase"> {item.parents[1].title}</p>
          </Link>
        </li>
        {Array.isArray(siblingsData) &&
          siblingsData.length > 0 &&
          siblingsData.map(
            ({ _id, slug, title, type, status }) =>
              type === "article" &&
              status === "PUBLISHED" && (
                <li key={_id} className={`flex flex-nowrap items-center gap-1 ${_id === item._id ? "rounded-md bg-gray-200 text-gray-900" : "text-gray-500"}`}>
                  <Link href={`/base-de-connaissance/${slug}`} className="rounded px-2 py-1.5" onClick={() => cache.clear()}>
                    <p className="text-[14px] font-medium leading-5">{title}</p>
                  </Link>
                </li>
              )
          )}
      </ol>
    );
  };

  return (
    <>
      {/* {device === "desktop" && <NavigationDesktop item={item} siblingsData={siblingsData} />}
      {device === "mobile" && (
        <Accordion
          key={item._id}
          title={item.parents[1].title}
          list={siblingsData}
          className="mb-3 w-full"
          path="/base-de-connaissance"
          isOpen={router.query.openTheme === item.slug}
          slug={item.slug}
        />
      )} */}
      <Accordion
        key={item._id}
        title={item.parents[1].title}
        list={siblingsData}
        className="mb-3 w-full"
        path="/base-de-connaissance"
        isOpen={router.query.openTheme === item.slug}
        slug={item.slug}
      />
    </>
  );
};

export default NavigationArticle;
