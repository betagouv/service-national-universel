import React from "react";

export default function Pagination({ pages, setCurrentPage, currentPage, className }) {
  console.log("🚀 ~ file: Pagination.js:4 ~ Pagination ~ pages", pages);
  console.log("🚀 ~ file: Pagination.js:4 ~ Pagination ~ currentPage", currentPage);
  const previousPages = pages.slice(currentPage - 4, currentPage - 1);
  console.log("🚀 ~ file: Historic2.js:147 ~ Pagination ~ previousPages", previousPages);
  const nextPages = pages.slice(currentPage, currentPage + 3);
  console.log("🚀 ~ file: Historic2.js:149 ~ Pagination ~ nextPages", nextPages);
  return (
    <div className={`flex justify-end gap-2 ${className}`}>
      {previousPages.length ? previousPages.map((e, index) => <PageButton key={index} page={e} setCurrentPage={setCurrentPage} currentPage={currentPage} />) : null}
      <PageButton page={currentPage} setCurrentPage={setCurrentPage} currentPage={currentPage} />
      {nextPages.length && nextPages.map((e, index) => <PageButton key={index} page={e} setCurrentPage={setCurrentPage} currentPage={currentPage} />)}
    </div>
  );
}

function PageButton({ page, setCurrentPage, currentPage }) {
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`py-2 px-3 rounded-lg ${currentPage === page ? "bg-gray-500 hover:bg-gray-100 text-slate-50 hover:text-slate-800" : "bg-gray-100 hover:bg-gray-500"}`}>
      {page}
    </button>
  );
}
