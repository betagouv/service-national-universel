import Img3 from "../assets/left.svg";
import Img2 from "../assets/right.svg";
import DoubleChevronRight from "../assets/icons/DoubleChevronRight";
import ChevronRightPage from "../assets/icons/ChevronRightPage";
import DoubleChevronLeft from "../assets/icons/DoubleChevronLeft";
import ChevronLeftPage from "../assets/icons/ChevronLeftPage";
/**
 * Ce composant va avec le HistoricServerDriven.
 * Il gère les données de pagination en provenance du serveur.
 * Et il reprend la forme de la pagination des reactlist.
 */
import React from "react";

const DEFAULT_DISPLAYED_PAGES = 3;

export default function PaginationServerDriven({ pageCount, currentPage, count, itemsPerPage, itemsCount, className, changePage, displayedPages = DEFAULT_DISPLAYED_PAGES }) {
  const lastPage = Math.min(pageCount - 1, Math.max(displayedPages, currentPage));
  const firstPage = Math.max(lastPage - displayedPages + 1, 1);
  const lastItem = currentPage * itemsPerPage + itemsCount;
  const pages = [];
  for (let i = firstPage; i <= lastPage; ++i) {
    pages.push(<PageButton key={"page-" + i} page={i} changePage={changePage} active={currentPage === i} />);
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
    if (lastItem < count) {
      changePage && changePage(currentPage + 1);
    }
  }
  function goToNextX5(e) {
    e.preventDefault();
    if (lastItem < count && lastItem + 100 < count) {
      changePage && changePage(currentPage + 5);
    } else {
      changePage && changePage(Math.floor(count / 20));
    }
  }
  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <div className="text-[12px] text-[#242526]">
        {currentPage * itemsPerPage + 1} - {currentPage * itemsPerPage + itemsCount} sur {count === 10000 ? "plus de 10000" : count}
      </div>
      <div className="flex justify-center items-center min-h-[32px] min-w-[65px] font-bold text-[12px] border border-gray-200 rounded-md border-solid">
        <div
          href="#"
          onClick={goToPreviousX5}
          className={`flex m-auto flex-none w-8 h-8 items-center justify-center border-r border-solid border-gray-200 ${
            currentPage > 0 ? "cursor-pointer" : "cursor-not-allowed"
          }`}>
          <DoubleChevronLeft fill={currentPage > 0 ? "#6B7280" : "#E5E7EB"} />
        </div>
        <div href="#" onClick={goToPrevious} className={`flex flex-none w-8 m-auto items-center justify-center ${currentPage > 0 ? "cursor-pointer" : "cursor-not-allowed"}`}>
          <ChevronLeftPage fill={currentPage > 0 ? "#6B7280" : "#E5E7EB"} />
        </div>
      </div>
      <PageButton page={0} changePage={changePage} active={currentPage === 0} />
      <div
        className={`ml-[5px] flex min-h-[30px] items-center justify-center rounded-[3px] border-[1px] border-[transparent] bg-[#f7fafc] py-[3px] px-[10px] text-[12px] font-bold text-[#242526] cursor-not-allowed`}>
        ...
      </div>

      {pages}

      <div
        className={`ml-[5px] flex min-h-[30px] items-center justify-center rounded-[3px] border-[1px] border-[transparent] bg-[#f7fafc] py-[3px] px-[10px] text-[12px] font-bold text-[#242526] cursor-not-allowed`}>
        ...
      </div>
      <PageButton page={Math.floor(count / 20)} changePage={changePage} active={currentPage === Math.floor(count / 20)} />

      <div className="flex justify-center items-center min-h-[32px] min-w-[65px] font-bold text-[12px] border border-gray-200 rounded-md border-solid">
        <div
          href="#"
          onClick={goToNext}
          className={`flex items-center justify-center flex-none w-8 h-8 m-auto border-r border-solid border-gray-200 ${lastItem < count ? "cursor-pointer" : "cursor-not-allowed"}`}>
          <ChevronRightPage fill={lastItem < count ? "#6B7280" : "#E5E7EB"} />
        </div>
        <div href="#" onClick={goToNextX5} className={`flex items-center justify-center flex-none w-8 m-auto ${lastItem < count ? "cursor-pointer" : "cursor-not-allowed"}`}>
          <DoubleChevronRight fill={lastItem < count ? "#6B7280" : "#E5E7EB"} />
        </div>
      </div>
    </div>
  );
}

function PageButton({ page, changePage, active }) {
  return (
    <div
      href="#"
      onClick={() => changePage(page)}
      className={`ml-[5px] flex min-h-[30px] cursor-pointer items-center justify-center rounded-[3px] border-[1px] border-[transparent] bg-[#f7fafc] py-[3px] px-[10px] text-[12px] text-[#242526] ${
        active ? "font-bold" : "font-regular"
      }`}>
      {page + 1}
    </div>
  );
}
