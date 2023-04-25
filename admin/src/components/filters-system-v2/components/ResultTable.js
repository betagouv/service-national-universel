import React from "react";

import PaginationServerDriven from "../../PaginationServerDriven";
export default function ResultTable({ render, currentEntryOnPage, pagination = true, paramData, setParamData }) {
  const pageCount = Math.ceil(paramData?.count / 20);

  return (
    <div>
      {render}
      {pagination && (
        <PaginationServerDriven
          pageCount={pageCount}
          currentPage={paramData.page}
          changePage={(value) => setParamData((old) => ({ ...old, page: value }))}
          count={paramData?.count}
          itemsPerPage={20}
          itemsCount={currentEntryOnPage}
          className="p-4"
        />
      )}
    </div>
  );
}
