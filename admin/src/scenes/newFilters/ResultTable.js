import React, { useEffect } from "react";

import PaginationServerDriven from "../../components/PaginationServerDriven";
export default function ResultTable({ render, currentCount, setPage, pagination = true, size, page, count }) {
  const pageCount = Math.ceil(count / size);
  useEffect(() => {
    setPage(0);
  }, [count]);
  return (
    <div>
      {render}{" "}
      {pagination && (
        <PaginationServerDriven pageCount={pageCount} currentPage={page} changePage={setPage} count={count} itemsPerPage={size} itemsCount={currentCount} className="p-4" />
      )}
    </div>
  );
}
