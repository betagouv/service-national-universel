import React, { useEffect } from "react";

import PaginationServerDriven from "../../components/PaginationServerDriven";
export default function ResultTable({ render, currentEntryOnPage, setPage, pagination = true, size, page, count }) {
  const pageCount = Math.ceil(count / size);
  useEffect(() => {
    setPage(0);
  }, [count]);
  return (
    <div>
      {render}{" "}
      {pagination && (
        <PaginationServerDriven pageCount={pageCount} currentPage={page} changePage={setPage} count={count} itemsPerPage={size} itemsCount={currentEntryOnPage} className="p-4" />
      )}
    </div>
  );
}
