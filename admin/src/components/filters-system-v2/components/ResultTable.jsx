import React from "react";

import PaginationServerDriven from "../../PaginationServerDriven";

export default function ResultTable({ render, currentEntryOnPage, pagination = true, paramData, setParamData, size = 10, setSize = null }) {
  return (
    <div>
      {pagination && (
        <PaginationServerDriven
          currentPageNumber={paramData.page}
          setCurrentPageNumber={(value) => setParamData((old) => ({ ...old, page: value }))}
          itemsCountTotal={paramData?.count}
          itemsCountOnCurrentPage={currentEntryOnPage}
          size={size}
          setSize={setSize}
        />
      )}
      {render}
      {pagination && (
        <PaginationServerDriven
          currentPageNumber={paramData.page}
          setCurrentPageNumber={(value) => setParamData((old) => ({ ...old, page: value }))}
          itemsCountTotal={paramData?.count}
          itemsCountOnCurrentPage={currentEntryOnPage}
          size={size}
          setSize={setSize}
        />
      )}
    </div>
  );
}
