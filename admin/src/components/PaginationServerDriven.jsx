import Img3 from "../assets/left.svg";
import Img2 from "../assets/right.svg";
/**
 * Ce composant va avec le HistoricServerDriven.
 * Il gère les données de pagination en provenance du serveur.
 * Et il reprend la forme de la pagination des reactlist.
 */
import React from "react";

const DEFAULT_DISPLAYED_PAGES = 4;

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

  function goToNext(e) {
    e.preventDefault();
    if (lastItem < count) {
      changePage && changePage(currentPage + 1);
    }
  }

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <div className="text-[12px] text-[#242526]">
        {currentPage * itemsPerPage + 1} - {currentPage * itemsPerPage + itemsCount} sur {count === 10000 ? "plus de 10000" : count}
      </div>
      <div
        href="#"
        onClick={goToPrevious}
        className={`ml-[5px] flex min-h-[30px] items-center justify-center rounded-[3px] border-[1px] border-[transparent] bg-[#f7fafc] py-[3px] px-[10px] text-[12px] font-bold text-[#242526] ${
          currentPage > 0 ? "cursor-pointer" : "cursor-not-allowed"
        }`}>
        <img src={Img3} alt="icon left" />
      </div>
      <PageButton page={0} changePage={changePage} active={currentPage === 0} />
      {pages}
      <div
        href="#"
        onClick={goToNext}
        className={`ml-[5px] flex min-h-[30px] items-center justify-center rounded-[3px] border-[1px] border-[transparent] bg-[#f7fafc] py-[3px] px-[10px] text-[12px] font-bold text-[#242526] ${
          lastItem < count ? "cursor-pointer" : "cursor-not-allowed"
        }`}>
        <img src={Img2} alt="icon right" />
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
