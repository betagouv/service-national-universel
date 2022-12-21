import React from "react";

export default function Pagination({ pageCount, setCurrentPage, currentPage, className }) {
  const pages = Array(pageCount)
    .fill(0)
    .map((_, i) => i + 1);
  const previousPages = pages.slice(currentPage - Math.min(4, currentPage), currentPage - 1);
  const nextPages = pages.slice(currentPage, currentPage + Math.min(3, pages.length - currentPage));

  return (
    <div className={`flex justify-end gap-2 ${className}`}>
      {previousPages.length ? previousPages.map((e, index) => <PageButton key={index} page={e} setCurrentPage={setCurrentPage} currentPage={currentPage} />) : null}
      <PageButton page={currentPage} setCurrentPage={setCurrentPage} currentPage={currentPage} />
      {nextPages.length ? nextPages.map((e, index) => <PageButton key={index} page={e} setCurrentPage={setCurrentPage} currentPage={currentPage} />) : null}
    </div>
  );
}

function PageButton({ page, setCurrentPage, currentPage }) {
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`py-2 px-3 rounded-lg ${
        currentPage === page ? "bg-gray-500 hover:bg-gray-100 text-slate-50 hover:text-slate-800" : "bg-gray-100 hover:bg-gray-500 hover:text-slate-50"
      }`}>
      {page}
    </button>
  );
}
