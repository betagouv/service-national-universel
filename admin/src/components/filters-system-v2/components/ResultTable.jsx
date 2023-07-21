import React from "react";

import PaginationServerDriven from "../../PaginationServerDriven";
export default function ResultTable({ render, currentEntryOnPage, pagination = true, paramData, setParamData, size = 20 }) {
  const pageCount = Math.ceil(paramData?.count / size);

  return (
    <div>
      {pagination && (
        <PaginationServerDriven
          pageCount={pageCount}
          currentPage={paramData.page}
          changePage={(value) => setParamData((old) => ({ ...old, page: value }))}
          count={paramData?.count}
          itemsPerPage={size}
          itemsCount={currentEntryOnPage}
          className="px-4 pt-3"
        />
      )}
      {render}
      {pagination && (
        <PaginationServerDriven
          pageCount={pageCount}
          currentPage={paramData.page}
          changePage={(value) => setParamData((old) => ({ ...old, page: value }))}
          count={paramData?.count}
          itemsPerPage={size}
          itemsCount={currentEntryOnPage}
          className="px-4 pt-3"
        />
      )}
    </div>
  );
}
