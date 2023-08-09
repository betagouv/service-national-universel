import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import React from "react";

const DEFAULT_DISPLAYED_PAGES = 2;

export default function Pagination({ pageCount, currentPage, count, itemsPerPage, itemsCount, className, changePage, displayedPages = DEFAULT_DISPLAYED_PAGES }) {
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
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-[12px] text-[#242526]">
        {currentPage * itemsPerPage + 1} - {currentPage * itemsPerPage + itemsCount} sur {count === 10000 ? "plus de 10000" : count}
      </div>
      <nav className="flex gap-2">
        <button
          onClick={goToPrevious}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-800 border-2 border-gray-100 aria-pressed:border-gray-200 aria-pressed:font-bold">
          <HiArrowLeft className="text-[#242526]" />
        </button>
        <PageButton page={0} changePage={changePage} active={currentPage === 0} />
        {pages}
        <button
          onClick={goToNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-800 border-2 border-gray-100 aria-pressed:border-gray-200 aria-pressed:font-bold">
          <HiArrowRight className="text-[#242526]" />
        </button>
      </nav>
    </div>
  );
}

function PageButton({ page, changePage, active }) {
  return (
    <button
      onClick={() => changePage(page)}
      aria-pressed={active}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-800 border-2 border-gray-100 aria-pressed:border-gray-200 aria-pressed:font-bold">
      {page + 1}
    </button>
  );
}
