import { HiChevronDoubleLeft, HiChevronDoubleRight, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { getPages, sizeOptions } from "../utils/pagination.utils";

/**
 * Ce composant va avec le HistoricServerDriven.
 * Il gère les données de pagination en provenance du serveur.
 */
import React from "react";
import { Select } from "@snu/ds/admin";

interface Props {
  currentPageNumber: number;
  setCurrentPageNumber: (page: number) => void;
  itemsCountTotal: number;
  itemsCountOnCurrentPage: number;
  size?: number;
  setSize?: (size: number) => void;
}

export default function PaginationServerDriven({ currentPageNumber, setCurrentPageNumber, itemsCountTotal, itemsCountOnCurrentPage, size = 10, setSize }: Props) {
  const displayedPages = 3;
  const itemsCountMax = 10000;
  let itemCountToDisplay = 0;
  if (itemsCountTotal > itemsCountMax) itemCountToDisplay = itemsCountMax;
  else itemCountToDisplay = itemsCountTotal;

  const pageCount = Math.ceil(itemCountToDisplay / size);
  const lastDisplayPage = Math.min(pageCount - 1, Math.max(displayedPages, currentPageNumber));
  const firstDisplayPage = Math.max(lastDisplayPage - displayedPages + 1, 1);
  const lastDisplayItem = currentPageNumber * size + itemsCountOnCurrentPage;
  const lastPage = Math.floor(itemCountToDisplay / size) || 0;

  const pages = getPages(lastDisplayItem, firstDisplayPage, lastDisplayPage, itemCountToDisplay, lastPage, size);

  function checkSize(newSize: number) {
    if (currentPageNumber * newSize > itemCountToDisplay) setCurrentPageNumber(Math.floor(itemCountToDisplay / newSize) - 1);
    setSize?.(newSize);
  }

  function goToPrevious() {
    if (currentPageNumber > 0) setCurrentPageNumber(currentPageNumber - 1);
  }
  function goToPreviousX5() {
    if (currentPageNumber > 4) return setCurrentPageNumber(currentPageNumber - 5);
    return setCurrentPageNumber(0);
  }

  function goToNext() {
    if (lastDisplayItem < itemCountToDisplay) setCurrentPageNumber(currentPageNumber + 1);
  }
  function goToNextX5() {
    if (lastDisplayItem < itemCountToDisplay && lastDisplayItem + 100 < itemCountToDisplay) return setCurrentPageNumber(currentPageNumber + 5);
    if (itemCountToDisplay % size === 0) return setCurrentPageNumber(lastPage - 1);
    return setCurrentPageNumber(lastPage);
  }

  return (
    <div className={"flex items-center justify-between gap-1 px-4 pt-3"}>
      {setSize ? (
        <div className="text-xs flex gap-2 justify-center items-center text-[#242526]">
          <Select
            placeholder="par page"
            defaultValue={sizeOptions[0].value}
            options={sizeOptions}
            closeMenuOnSelect={true}
            value={sizeOptions.find((option) => Number(option.value) === size) || null}
            onChange={(option) => {
              checkSize(Number(option.value));
            }}
            size="sm"
            controlCustomStyle={{
              boxShadow: "none",
            }}
          />
          Éléments par page
        </div>
      ) : null}
      <div className="text-xs text-gray-800 font-bold">
        <span className="font-normal">Affichage</span> {currentPageNumber * size + 1}
        <span className="font-normal"> à </span>
        {currentPageNumber * size + itemsCountOnCurrentPage} <span className="font-normal"> sur </span> {itemsCountTotal || 0}
      </div>
      <div className="flex gap-1 items-center justify-center">
        <div className="flex justify-center items-center min-h-[32px] min-w-[65px] font-bold text-xs border border-gray-200 rounded-md border-solid">
          <button
            onClick={goToPreviousX5}
            className="flex m-auto flex-none w-8 h-8 items-center justify-center border-r border-solid border-gray-200"
            style={currentPageNumber > 0 ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronDoubleLeft size={16} className={currentPageNumber > 0 ? "text-gray-600" : "text-gray-200"} />
          </button>
          <button
            onClick={goToPrevious}
            className="flex flex-none w-8 m-auto items-center justify-center"
            style={currentPageNumber > 0 ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronLeft size={16} className={currentPageNumber > 0 ? "text-gray-600" : "text-gray-200"} />
          </button>
        </div>
        <div className="flex justify-center items-center min-h-[32px] text-xs text-gray-600 border border-gray-200 rounded-md border-solid">
          <PageButton page={0} setCurrentPageNumber={setCurrentPageNumber} active={currentPageNumber === 0} lastPage={lastPage} isLast={lastPage === firstDisplayPage} />

          {(currentPageNumber > 2 && lastPage - currentPageNumber > 1) || currentPageNumber === lastPage - 1 ? (
            <div className="flex px-1 text-xs text-gray-400 border-gray-200 border-r border-solid min-h-[32px] items-center">...</div>
          ) : null}

          {pages.map((i) => (
            <PageButton key={i} page={i} setCurrentPageNumber={setCurrentPageNumber} active={currentPageNumber === i} lastPage={lastPage} />
          ))}

          {currentPageNumber < (itemCountToDisplay % size === 0 ? lastPage - 3 : lastPage - 2) && currentPageNumber + 4 < lastPage ? (
            <div className="flex px-1 text-xs text-gray-400 border-gray-200 border-r border-solid min-h-[32px] items-center">...</div>
          ) : null}
          {lastPage !== 0 && lastPage !== firstDisplayPage ? (
            <PageButton
              page={itemCountToDisplay % size === 0 ? lastPage - 1 : lastPage}
              setCurrentPageNumber={setCurrentPageNumber}
              active={currentPageNumber === (itemCountToDisplay % size === 0 ? lastPage - 1 : lastPage)}
              lastPage={lastPage}
              isLast={true}
            />
          ) : null}
        </div>

        <div
          className={`group relative flex justify-center items-center min-h-[32px] min-w-[65px] font-bold text-xs border border-gray-200 rounded-md border-solid ${
            lastDisplayItem < itemCountToDisplay ? "cursor-pointer" : "cursor-not-allowed"
          }`}>
          <button
            onClick={goToNext}
            className="flex items-center justify-center flex-none w-8 h-8 m-auto border-r border-solid border-gray-200"
            style={lastDisplayItem < itemCountToDisplay ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronRight size={16} className={lastDisplayItem < itemCountToDisplay ? "text-gray-600" : "text-gray-200"} />
          </button>
          <button
            onClick={goToNextX5}
            className="flex items-center justify-center flex-none w-8 m-auto"
            style={lastDisplayItem < itemCountToDisplay ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronDoubleRight size={16} className={lastDisplayItem < itemCountToDisplay ? "text-gray-600" : "text-gray-200"} />
          </button>
          {currentPageNumber === lastPage - 1 ? (
            <div className="absolute hidden group-hover:flex text-xs border border-gray-200 font-normal rounded-md border-solid w-40 text-center py-2 px-2 text-gray-400 bg-white right-0 bottom-0 transform translate-y-[110%]">
              Pour voir plus de résultats, veuillez affiner votre recherche.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PageButton({ page, setCurrentPageNumber, active, lastPage, isLast = false }) {
  const getClass = () => {
    const classTab: string[] = [];
    active ? classTab.push("font-bold bg-gray-100 text-gray-900") : classTab.push("font-normal"); // la page est active
    page !== lastPage && !isLast ? classTab.push("border-r border-solid border-gray-200") : null; // page par defaut
    page === 0 && active ? classTab.push("rounded-l-md") : null; //premiere page active
    (page === lastPage && active) || isLast === true ? classTab.push("rounded-r-md") : null; //derniere page
    const className = classTab.join(" ");
    return className;
  };
  return (
    <button onClick={() => setCurrentPageNumber(page)} className={`flex items-center justify-center flex-none w-8 h-8 m-auto` + getClass()}>
      {(page + 1).toString()}
    </button>
  );
}
