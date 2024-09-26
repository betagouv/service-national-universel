import React, { useEffect } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineExternalLink } from "react-icons/hi";
import { Link } from "react-router-dom";
import { getNewLink } from "@/utils";

const PAGE_SIZE = 6;

export default function TabSession({ sessionByCenter, filters }) {
  const [sessionData, setSessionData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageMax, setPageMax] = React.useState(0);
  const [noResult, setNoResult] = React.useState(false);
  const [total, setTotal] = React.useState(0);

  const getYoungsBySession = async () => {
    if (sessionByCenter.length === 0) {
      setNoResult(true);
      setPage(0);
      setPageMax(0);
      setTotal(0);
      return;
    }

    setNoResult(false);
    setPage(0);
    setPageMax(Math.trunc(sessionByCenter.length / PAGE_SIZE));
    setTotal(sessionByCenter.length);
    setSessionData(sessionByCenter);
    setIsLoading(false);
  };

  useEffect(() => {
    if (sessionByCenter) {
      getYoungsBySession(sessionByCenter);
    }
  }, [sessionByCenter]);

  return (
    <div className="flex flex-col gap-5 rounded-lg bg-white px-8 py-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3">
        <p className="text-left text-base font-bold leading-5 text-gray-900">Liste des centres</p>
        <Link to={getNewLink({ base: `/centre/liste/presence`, filter: filters, filtersUrl: [] })} target={"_blank"}>
          <HiOutlineExternalLink className="h-5 w-5 cursor-pointer text-gray-400" />
        </Link>
      </div>
      <table className={`w-full table-fixed ${isLoading || noResult ? "h-full" : ""}`}>
        <thead>
          <tr className="flex items-center border-y-[1px] border-gray-100 py-4">
            <th className="w-[40%] text-xs font-medium uppercase leading-4 text-gray-400">centres</th>
            <th className="w-[30%] text-xs font-medium uppercase leading-4 text-gray-400">
              présence non <br />
              renseignée à l’arrivée
            </th>
            <th className="w-[30%] text-xs font-medium uppercase leading-4 text-gray-400">
              présence non <br />
              renseignée à LA JDM
            </th>
          </tr>
        </thead>
        <tbody className="">
          {isLoading ? (
            Array.from(Array(PAGE_SIZE).keys()).map((i) => (
              <tr key={`LoadingCenter${i}`} className="flex h-1/6 items-center border-b-[1px] border-gray-100">
                <td className="w-[40%]">
                  <Loading width="w-[50%]" />
                </td>
                <td className="w-[30%]">
                  <Loading width="w-[50%]" />
                </td>
                <td className="w-[30%]">
                  <Loading width="w-[50%]" />
                </td>
              </tr>
            ))
          ) : !noResult ? (
            sessionData?.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)?.map((center) => (
              <tr key={center?.centerId} className="flex h-1/6 cursor-default items-center border-b-[1px] border-gray-100 py-3  hover:bg-gray-50">
                <td className="flex w-[40%] flex-col gap-1">
                  <Link
                    to={`/centre/${center.centerId}`}
                    target="_blank"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="cursor-pointer">
                    <p className="truncate text-sm font-bold leading-6 text-gray-900">{center.centerName}</p>
                    <p className="text-xs leading-4 text-gray-500">
                      {center?.centerCity} • {center.department}
                    </p>
                  </Link>
                </td>
                <td className="w-[30%] text-sm leading-3 text-gray-500">
                  <span className="font-bold text-gray-900">{center.presence}</span> ({Math.round((center.presence / center.total) * 100) || 0}%)
                </td>
                <td className="w-[30%] text-sm leading-3 text-gray-500">
                  <span className="font-bold text-gray-900">{center.presenceJDM}</span> ({Math.round((center.presenceJDM / center.total) * 100) || 0}%)
                </td>
              </tr>
            ))
          ) : (
            <tr className="flex h-full items-center justify-center">
              <td className="text-sm font-normal leading-5 text-gray-700">Aucun résultat</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between pt-4">
        <p className="text-xs font-normal leading-5 text-gray-700">
          {noResult ? 0 : page * PAGE_SIZE + 1}-<strong> {page * PAGE_SIZE + PAGE_SIZE >= total ? total : page * PAGE_SIZE + PAGE_SIZE}</strong> sur <strong>{total}</strong>{" "}
          résultats
        </p>
        <div className="flex items-center">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-l-md border-[1px] border-gray-300"
            onClick={() => {
              if (page > 0) setPage(page - 1);
            }}>
            <HiOutlineChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-r-md border-y-[1px] border-r-[1px] border-gray-300"
            onClick={() => {
              if (page < pageMax) setPage(page + 1);
            }}>
            <HiOutlineChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Loading({ width }) {
  return (
    <div className={`flex animate-pulse space-x-4 ${width}`}>
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4 ">
          <div className="col-span-2 h-2 rounded bg-gray-300"></div>
          <div className="col-span-1 h-2 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
