import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import React from "react";

const DEFAULT_DISPLAYED_PAGES = 2;

export default function Pagination({ pageCount, currentPage, count, itemsPerPage, itemsCount, changePage, displayedPages = DEFAULT_DISPLAYED_PAGES }) {
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
    <div className="flex gap-2 my-4 items-center justify-between">
      <div className="text-[12px] text-[#242526]">
        {currentPage * itemsPerPage + 1} - {currentPage * itemsPerPage + itemsCount} sur {count === 10000 ? "plus de 10000" : count}
      </div>

      <nav className="flex gap-2 text-gray-600">
        <button
          onClick={goToPrevious}
          className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs hover:bg-blue-600 hover:text-white aria-pressed:font-bold">
          <HiArrowLeft className="group-hover:text-white" />
        </button>
        <PageButton page={0} changePage={changePage} active={currentPage === 0} />
        {pages}
        <button
          onClick={goToNext}
          className="group flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs hover:bg-blue-600 hover:text-white aria-pressed:font-bold">
          <HiArrowRight className="group-hover:text-white" />
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
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs hover:bg-blue-600 hover:text-white aria-pressed:bg-blue-600 aria-pressed:text-white aria-pressed:font-bold">
      {page + 1}
    </button>
  );
}
