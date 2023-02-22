import React from "react";

import PaginationServerDriven from "../../components/PaginationServerDriven";
export default function ResultTable({ render, currentCount, setPage, pagination = true, size, page, count }) {
  console.log("nombre de pasge total", count / size);
  return (
    <div>
      {render}{" "}
      {pagination && (
        <PaginationServerDriven
          pageCount={count / size}
          currentPage={page - 1}
          changePage={(value) => setPage(value + 1)}
          count={count}
          itemsPerPage={size}
          itemsCount={currentCount}
          className="p-4"
        />
      )}
    </div>
  );
}
