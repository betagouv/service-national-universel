import React from "react";
import { HiChevronDoubleLeft, HiChevronDoubleRight, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { getPages, sizeOptions } from "../../utils/pagination.utils";

export default function Pagination({ currentPageNumber, setCurrentPageNumber, itemsCountTotal, itemsCountOnCurrentPage, size = 20, setSize }) {
  const displayedPages = 3;
  const pageCount = Math.ceil(itemsCountTotal / size);
  const lastDisplayPage = Math.min(pageCount - 1, Math.max(displayedPages, currentPageNumber));
  const firstDisplayPage = Math.max(lastDisplayPage - displayedPages + 1, 1);
  const lastDisplayItem = currentPageNumber * size + itemsCountOnCurrentPage;
  const lastPage = Math.floor(itemsCountTotal / size) || 0;
  const pages = getPages(lastDisplayItem, firstDisplayPage, lastDisplayPage, itemsCountTotal, lastPage, size);

  function checkSize(newSize) {
    if (currentPageNumber * newSize > itemsCountTotal) setCurrentPageNumber(Math.floor(itemsCountTotal / newSize));
    setSize(newSize);
  }
  function goToPrevious() {
    if (currentPageNumber > 0) setCurrentPageNumber(currentPageNumber - 1);
  }
  function goToPreviousX5() {
    if (currentPageNumber > 4) return setCurrentPageNumber(currentPageNumber - 5);
    return setCurrentPageNumber(0);
  }
  function goToNext() {
    if (lastDisplayItem < itemsCountTotal) setCurrentPageNumber(currentPageNumber + 1);
  }
  function goToNextX5() {
    if (lastDisplayItem < itemsCountTotal && lastDisplayItem + 100 < itemsCountTotal) return setCurrentPageNumber(currentPageNumber + 5);
    if (itemsCountTotal % size === 0) return setCurrentPageNumber(lastPage - 1);
    return setCurrentPageNumber(lastPage);
  }

  return (
    <div className="flex items-center justify-between gap-1">
      {setSize ? (
        <div className="text-xs flex gap-2 justify-center items-center text-[#242526]">
          <select className="min-w-[56px] min-h-[32px] pl-2 border text-gray-600 rounded-md pb-1" value={size} onChange={(e) => checkSize(parseInt(e.target.value))}>
            {sizeOptions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          Éléments par page
        </div>
      ) : null}
      <div className="text-xs text-gray-800 font-bold">
        {currentPageNumber * size + 1} <span className="font-normal">-</span> {currentPageNumber * size + itemsCountOnCurrentPage} <span className="font-normal"> sur </span>{" "}
        {itemsCountTotal === 10000 ? "plus de 10000" : itemsCountTotal || 0}
      </div>
      <div className="flex gap-1 items-center justify-center">
        <div className="flex justify-center items-center min-h-[32px] min-w-[65px] font-bold text-xs border border-gray-200 rounded-md border-solid">
          <button
            onClick={goToPreviousX5}
            className="flex m-auto flex-none w-8 h-8 items-center justify-center border-r border-solid border-gray-200"
            style={currentPageNumber > 0 ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronDoubleLeft size={16} className={currentPageNumber > 0 ? "text-gray-600" : "text-gray-200"} />
          </button>
          <button
            onClick={goToPrevious}
            className="flex flex-none w-8 m-auto items-center justify-center"
            style={currentPageNumber > 0 ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronLeft size={16} className={currentPageNumber > 0 ? "text-gray-600" : "text-gray-200"} />
          </button>
        </div>
        <div className="flex justify-center items-center min-h-[32px] text-xs text-gray-600 border border-gray-200 rounded-md border-solid">
          <PageButton page={0} setCurrentPageNumber={setCurrentPageNumber} active={currentPageNumber === 0} lastPage={lastPage} isLast={lastPage === firstDisplayPage} />

          {currentPageNumber > 2 ? <div className="flex px-1 text-xs text-gray-400 border-gray-200 border-r border-solid min-h-[32px] items-center">...</div> : null}

          {pages.map((i) => (
            <PageButton key={i} page={i} setCurrentPageNumber={setCurrentPageNumber} active={currentPageNumber === i} lastPage={lastPage} />
          ))}
          {currentPageNumber < (itemsCountTotal % size === 0 ? lastPage - 3 : lastPage - 2) ? (
            <div className="flex px-1 text-xs text-gray-400 border-gray-200 border-r border-solid min-h-[32px] items-center">...</div>
          ) : null}
          {lastPage !== 0 && lastPage !== firstDisplayPage ? (
            <PageButton
              page={itemsCountTotal % size === 0 ? lastPage - 1 : lastPage}
              setCurrentPageNumber={setCurrentPageNumber}
              active={currentPageNumber === (itemsCountTotal % size === 0 ? lastPage - 1 : lastPage)}
              lastPage={lastPage}
              isLast={true}
            />
          ) : null}
        </div>

        <div className="flex justify-center items-center min-h-[32px] min-w-[65px] font-bold text-xs border border-gray-200 rounded-md border-solid">
          <button
            onClick={goToNext}
            className="flex items-center justify-center flex-none w-8 h-8 m-auto border-r border-solid border-gray-200"
            style={lastDisplayItem < itemsCountTotal ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronRight size={16} className={lastDisplayItem < itemsCountTotal ? "text-gray-600" : "text-gray-200"} />
          </button>
          <button
            onClick={goToNextX5}
            className="flex items-center justify-center flex-none w-8 m-auto"
            style={lastDisplayItem < itemsCountTotal ? { cursor: "pointer" } : { cursor: "not-allowed" }}>
            <HiChevronDoubleRight size={16} className={lastDisplayItem < itemsCountTotal ? "text-gray-600" : "text-gray-200"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PageButton({ page, setCurrentPageNumber, active, lastPage, isLast = false }) {
  const getClass = () => {
    let classTab = [];
    active ? classTab.push("font-bold bg-gray-100 text-gray-900") : classTab.push("font-normal"); // la page est active
    page !== lastPage && !isLast ? classTab.push("border-r border-solid border-gray-200") : null; // page par defaut
    page === 0 && active ? classTab.push("rounded-l-md") : null; //premiere page active
    (page === lastPage && active) || isLast === true ? classTab.push("rounded-r-md") : null; //derniere page
    const className = classTab.join(" ");
    return className;
  };
  return (
    <button onClick={() => setCurrentPageNumber(page)} className={`flex items-center justify-center flex-none w-8 h-8 m-auto` + getClass()}>
      {(page + 1).toString()}
    </button>
  );
}
