/**
 * Ce composant va avec le Historic3.
 * Il gère les données de pagination en provenance du serveur.
 * Et il reprend la forme de la pagination des reactlist.
 */
import React from "react";

const DISPLAYED_PAGES = 4;

export default function Pagination3({ pageCount, currentPage, count, itemsPerPage, itemsCount, className, changePage }) {
  const lastPage = Math.min(pageCount - 1, Math.max(DISPLAYED_PAGES, currentPage));
  const firstPage = Math.max(lastPage - DISPLAYED_PAGES + 1, 1);
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
    if (currentPage < pageCount) {
      changePage && changePage(currentPage + 1);
    }
  }

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <div className="text-[#242526] text-[12px]">
        {currentPage * itemsPerPage + 1} - {currentPage * itemsPerPage + itemsCount} sur {count}
      </div>
      <a
        href="#"
        onClick={goToPrevious}
        className={`flex items-center justify-center rounded-[3px] border-[1px] border-[transparent] bg-[#f7fafc] text-[#242526] py-[3px] px-[10px] ml-[5px] text-[12px] font-bold min-h-[30px] ${
          currentPage > 0 ? "cursor-pointer" : "cursor-not-allowed"
        }`}>
        <img src={require("../assets/left.svg")} alt="icon left" />
      </a>
      <PageButton page={0} changePage={changePage} active={currentPage === 0} />
      {pages}
      <a
        href="#"
        onClick={goToNext}
        className={`flex items-center justify-center rounded-[3px] border-[1px] border-[transparent] bg-[#f7fafc] text-[#242526] py-[3px] px-[10px] ml-[5px] text-[12px] font-bold min-h-[30px] ${
          lastItem < count ? "cursor-pointer" : "cursor-not-allowed"
        }`}>
        <img src={require("../assets/right.svg")} alt="icon right" />
      </a>
    </div>
  );
}

function PageButton({ page, changePage, active }) {
  return (
    <a
      href="#"
      onClick={() => changePage(page)}
      className={`flex items-center justify-center rounded-[3px] border-[1px] border-[transparent] bg-[#f7fafc] text-[#242526] py-[3px] px-[10px] ml-[5px] text-[12px] cursor-pointer min-h-[30px] ${
        active ? "font-bold" : "font-regular"
      }`}>
      {page + 1}
    </a>
  );
}
