/* import DoubleChevronRight from "../assets/icons/DoubleChevronRight";
import ChevronRightPage from "../assets/icons/ChevronRightPage";
import DoubleChevronLeft from "../assets/icons/DoubleChevronLeft";
import ChevronLeftPage from "../assets/icons/ChevronLeftPage"; */
import { HiChevronDoubleLeft } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import { HiChevronLeft } from "react-icons/hi";
import { HiChevronRight } from "react-icons/hi";

/**
 * Ce composant va avec le HistoricServerDriven.
 * Il gère les données de pagination en provenance du serveur.
 */
import React from "react";

const DEFAULT_DISPLAYED_PAGES = 3;

export default function PaginationServerDriven({ pageCount, currentPage, count, itemsPerPage, itemsCount, className, changePage, displayedPages = DEFAULT_DISPLAYED_PAGES }) {
  const lastDisplayPage = Math.min(pageCount - 1, Math.max(displayedPages, currentPage));
  const firstDisplayPage = Math.max(lastDisplayPage - displayedPages + 1, 1);
  const lastDisplayItem = currentPage * itemsPerPage + itemsCount;
  const lastPage = Math.floor(count / 20);
  const pages = [];

  switch (true) {
    case lastDisplayItem === count: //derniere page
      for (let i = firstDisplayPage - 1; i <= lastDisplayPage - 1; ++i) {
        pages.push(<PageButton key={"page-" + i} page={i} changePage={changePage} active={currentPage === i} lastPage={lastPage} />);
      }
      break;
    case lastDisplayItem >= count - 20: // avant derniere page
      for (let i = firstDisplayPage; i <= lastDisplayPage; ++i) {
        pages.push(<PageButton key={"page-" + i} page={i} changePage={changePage} active={currentPage === i} lastPage={lastPage} />);
      }
      break;

    case lastDisplayItem / 20 === 1 || lastDisplayItem / 20 === 2 || lastDisplayItem / 20 === 3: // page 1,2,3
      for (let i = firstDisplayPage; i <= lastDisplayPage; ++i) {
        pages.push(<PageButton key={"page-" + i} page={i} changePage={changePage} active={currentPage === i} lastPage={lastPage} />);
      }
      break;

    default:
      for (let i = firstDisplayPage + 1; i <= lastDisplayPage + 1; ++i) {
        // page par default
        pages.push(<PageButton key={"page-" + i} page={i} changePage={changePage} active={currentPage === i} lastPage={lastPage} />);
      }
      break;
  }
  function goToPrevious(e) {
    e.preventDefault();
    if (currentPage > 0) {
      changePage && changePage(currentPage - 1);
    }
  }
  function goToPreviousX5(e) {
    e.preventDefault();
    if (currentPage > 4) {
      changePage && changePage(currentPage - 5);
    } else {
      changePage && changePage(0);
    }
  }

  function goToNext(e) {
    e.preventDefault();
    if (lastDisplayItem < count) {
      changePage && changePage(currentPage + 1);
    }
  }
  function goToNextX5(e) {
    e.preventDefault();
    if (lastDisplayItem < count && lastDisplayItem + 100 < count) {
      return changePage && changePage(currentPage + 5);
    }
    if (count % 20 === 0) {
      return changePage && changePage(lastPage - 1);
    }
    return changePage && changePage(lastPage);
  }
  return (
    <div className={`flex items-center justify-between gap-1 ${className}`}>
      <div className="text-[12px] text-[#242526] font-bold">
        {currentPage * itemsPerPage + 1} <span className="font-normal">-</span> {currentPage * itemsPerPage + itemsCount} <span className="font-normal"> sur </span>{" "}
        {count === 10000 ? "plus de 10000" : count}
      </div>
      <div className="flex gap-1 items-center justify-center">
        <div className="flex justify-center items-center min-h-[32px] min-w-[65px] font-bold text-[12px] border border-gray-200 rounded-md border-solid">
          <button
            onClick={goToPreviousX5}
            className="flex m-auto flex-none w-8 h-8 items-center justify-center border-r border-solid border-gray-200"
            style={currentPage > 0 ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronDoubleLeft size={16} className={currentPage > 0 ? "text-gray-600" : "text-gray-200"} />
          </button>
          <button
            onClick={goToPrevious}
            className="flex flex-none w-8 m-auto items-center justify-center"
            style={currentPage > 0 ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronLeft size={16} className={currentPage > 0 ? "text-gray-600" : "text-gray-200"} />
          </button>
        </div>
        <div className="flex justify-center items-center min-h-[32px] text-xs text-gray-600 border border-gray-200 rounded-md border-solid">
          <PageButton page={0} changePage={changePage} active={currentPage === 0} lastPage={lastPage} />

          {currentPage > 2 ? <div className="flex px-1 text-xs text-gray-400 border-gray-200 border-r border-solid min-h-[32px] items-center">...</div> : null}

          {pages}
          {currentPage < (count % 20 === 0 ? lastPage - 3 : lastPage - 2) ? (
            <div className="flex px-1 text-xs text-gray-400 border-gray-200 border-r border-solid min-h-[32px] items-center">...</div>
          ) : null}
          {lastPage !== 0 ? (
            <PageButton
              page={count % 20 === 0 ? lastPage - 1 : lastPage}
              changePage={changePage}
              active={currentPage === (count % 20 === 0 ? lastPage - 1 : lastPage)}
              lastPage={lastPage}
              isLast={true}
            />
          ) : null}
        </div>

        <div className="flex justify-center items-center min-h-[32px] min-w-[65px] font-bold text-[12px] border border-gray-200 rounded-md border-solid">
          <button
            onClick={goToNext}
            className="flex items-center justify-center flex-none w-8 h-8 m-auto border-r border-solid border-gray-200"
            style={lastDisplayItem < count ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronRight size={16} className={lastDisplayItem < count ? "text-gray-600" : "text-gray-200"} />
          </button>
          <button
            onClick={goToNextX5}
            className="flex items-center justify-center flex-none w-8 m-auto"
            style={lastDisplayItem < count ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronDoubleRight size={16} className={lastDisplayItem < count ? "text-gray-600" : "text-gray-200"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PageButton({ page, changePage, active, lastPage, isLast = false }) {
  const getClass = () => {
    let classTab = [];
    active ? classTab.push("font-bold bg-gray-100 text-gray-900") : classTab.push("font-normal"); // la page est active
    page !== lastPage && !isLast ? classTab.push("border-r border-solid border-gray-200") : null; // page par default
    page === 0 && active ? classTab.push("rounded-l-md") : null; //premiere page active
    (page === lastPage && active) || isLast === true ? classTab.push("rounded-r-md") : null; //derniere page
    const className = classTab.join(" ");
    return className;
  };
  return (
    <button onClick={() => changePage(page)} className={`flex items-center justify-center flex-none w-8 h-8 m-auto ` + getClass()}>
      {page + 1}
    </button>
  );
}
