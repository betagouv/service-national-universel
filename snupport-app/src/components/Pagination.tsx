import React from "react";

import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

import { classNames } from "../utils";

// https://www.freecodecamp.org/news/build-a-custom-pagination-component-in-react/
const DOTS = "...";

export const range = (start, end) => {
  let length = end - start + 1;
  /*
    Create an array of certain length and set the elements within it from
    start value to end value.
  */
  return Array.from({ length }, (_, idx) => idx + start);
};

export const getPaginationRange = ({ total, pageSize, siblingCount = 1, currentPage }: { total: number; pageSize: number; siblingCount?: number; currentPage: number }) => {
  const totalPageCount = Math.ceil(total / pageSize);

  // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
  const totalPageNumbers = siblingCount + 5;

  /*
      Case 1:
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
  if (totalPageNumbers >= totalPageCount) {
    return range(1, totalPageCount);
  }

  /*
    Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
    */
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

  /*
   We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
   */
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPageCount;

  /*
      Case 2: No left dots to show, but rights dots to be shown
    */
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = range(1, leftItemCount);

    return [...leftRange, DOTS, totalPageCount];
  }

  /*
      Case 3: No right dots to show, but left dots to be shown
    */
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount);
    return [firstPageIndex, DOTS, ...rightRange];
  }

  /*
      Case 4: Both left and right dots to be shown
    */
  let middleRange = range(leftSiblingIndex, rightSiblingIndex);
  return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
};

export const paginate = (items, page = 1, perPage = 10) => items.slice(perPage * (page - 1), perPage * page);

export default function Pagination({ currentPage, total, onPageChange, range, onSizeChange, className = "", tickets, selectedTicket, setSelectedTicket }) {
  const totalPages = Math.ceil(total / range);

  // Redirect to the last page if currentPage exceeds totalPages
  if (totalPages > 0 && currentPage > totalPages) {
    onPageChange(totalPages);
    return null;
  }

  const paginationRange = getPaginationRange({
    currentPage,
    total,
    pageSize: range,
  });

  const indexMax = Math.min(currentPage * range, total);

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  const lastPage = paginationRange[paginationRange.length - 1];
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === lastPage;
  const pagination = [10, 20, 30, 40, 50];

  return (
    <div className={`flex items-center justify-between bg-white gap-3 ${className}`}>
      <SelectAll tickets={tickets} selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket} />
      <div className="flex flex-1 items-center justify-between">
        <div>
          <select
            defaultValue={range}
            onChange={(e) => onSizeChange(parseInt(e.target.value))}
            className="rounded border border-gray-300 py-1.5 pl-3.5 pr-8 text-gray-900 shadow-sm transition-colors focus:border-gray-400"
          >
            {Object.values(pagination).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">{`${1 + (currentPage - 1) * range}`}</span>-<span className="">{`${indexMax}`}</span> sur <span className="font-medium">{total}</span>{" "}
            résultats
          </p>
        </div>
        <nav>
          <ul className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <li>
              <button onClick={onPrevious} className={classNames(isFirstPage && "pointer-events-none bg-gray-300", "pagination-item rounded-l-md")}>
                <span className="sr-only">Précédent</span>
                <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            </li>
            {paginationRange.map((pageNumber, i) => {
              // If the pageItem is a DOT, render the DOTS unicode character
              if (pageNumber === DOTS) {
                return (
                  <li key={i} className="pagination-item cursor-default hover:bg-white">
                    &#8230;
                  </li>
                );
              }

              // Render our Page Pills
              return (
                <li key={i}>
                  <button
                    className={classNames("pagination-item", pageNumber === currentPage && "z-10 border-indigo-500 bg-indigo-50 text-indigo-600")}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                </li>
              );
            })}
            <li>
              <button className={classNames(isLastPage && "pointer-events-none bg-gray-300", "pagination-item rounded-r-md")} onClick={onNext}>
                <span className="sr-on sr-only">Suivant</span>
                <HiChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

const SelectAll = ({ tickets, selectedTicket, setSelectedTicket }) => {
  return (
    <div className="items-center">
      <input
        type="checkbox"
        className="h-[37px] w-[37px]  rounded border-gray-300 text-indigo-600"
        checked={selectedTicket?.length !== 0 && tickets?.length === selectedTicket?.length}
        onChange={(e) => {
          e.stopPropagation();
          if (tickets?.length === selectedTicket?.length) {
            setSelectedTicket([]);
          } else {
            setSelectedTicket(tickets?.map((ticket) => ticket._id));
          }
        }}
      />
    </div>
  );
};
