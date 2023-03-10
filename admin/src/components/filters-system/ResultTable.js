import React from "react";

import PaginationServerDriven from "../../components/PaginationServerDriven";
export default function ResultTable({ render, currentEntryOnPage, setPage, pagination = true, size = 25, page, count }) {
  const pageCount = Math.ceil(count / size);

  return (
    <div>
      {render}
      {pagination && (
        <PaginationServerDriven pageCount={pageCount} currentPage={page} changePage={setPage} count={count} itemsPerPage={size} itemsCount={currentEntryOnPage} className="p-4" />
      )}
    </div>
  );
}
