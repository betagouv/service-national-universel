import React, { useEffect } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineExternalLink } from "react-icons/hi";
import { ROLES } from "snu-lib";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../../../../services/api";
import { getNewLink, replaceSpaces } from "../../../../utils";
import queryString from "query-string";

const PAGE_SIZE = 6;

export default function TabSchool({ filters }) {
  const [youngBySchool, setYoungBySchool] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageMax, setPageMax] = React.useState(0);
  const [noResult, setNoResult] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const user = useSelector((state) => state.Auth.user);

  const fetchYoungByschool = async () => {
    setYoungBySchool(null);
    setNoResult(false);
    setTotal(0);
    setPageMax(0);
    setIsLoading(true);

    const responses = await api.post("/elasticsearch/dashboard/inscription/youngBySchool", { filters: filters });
    if (!responses?.aggregations) return setNoResult(true);
    if (setNoResult(responses.aggregations.school.buckets.length === 0)) {
      setNoResult(true);
      setIsLoading(false);
      return;
    }

    let reducedSchool = responses?.aggregations?.school?.buckets?.reduce((acc, school) => {
      if (school.key === "") return acc;
      const schoolInfo = school.firstUser?.hits?.hits[0]?._source;
      const total = school.doc_count;
      const isThereDep = school.departments?.buckets?.find((f) => f.key === schoolInfo.schoolDepartment) || {};
      const inDepartment = isThereDep.doc_count || 0;
      const outDepartment = total - inDepartment;

      return [
        ...acc,
        {
          schoolId: school.key,
          schoolName: schoolInfo.schoolName,
          schoolCity: schoolInfo.schoolCity,
          schoolZip: schoolInfo.schoolZip,
          total,
          inDepartment,
          outDepartment,
        },
      ];
    }, []);

    reducedSchool = reducedSchool.sort((a, b) => b.total - a.total);

    setYoungBySchool(reducedSchool);
    setTotal(reducedSchool?.length);
    setNoResult(reducedSchool.length === 0);
    setPageMax(Math.trunc(reducedSchool.length / PAGE_SIZE) || 0);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchYoungByschool();
  }, [filters]);

  return (
    <div className="flex w-[60%] flex-col gap-5 rounded-lg bg-white px-8 py-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
      <div className="flex w-full flex-row justify-between">
        <div className="flex items-center gap-3">
          <div className="text-base font-bold text-gray-900">Liste des établissements</div>
          <Link to={getNewLink({ base: `/school/liste-jeunes`, filter: filters, filtersUrl: [queryString.stringify({ departmentName: filters.department })] })} target={"_blank"}>
            <HiOutlineExternalLink className="h-5 w-5 cursor-pointer text-gray-400" />
          </Link>
        </div>
        {user.role !== ROLES.VISITOR ? (
          <div className="text-xs text-gray-600">
            Export depuis le menu{" "}
            <Link
              to={`/inscription`}
              target="_blank"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="cursor-pointer text-blue-600">
              Inscriptions
            </Link>
          </div>
        ) : null}
      </div>
      <table className={`w-full table-fixed ${isLoading || noResult ? "h-full" : ""}`}>
        <thead>
          <tr className="flex items-center border-y-[1px] border-gray-100 py-4">
            <th className="w-[80%] text-xs font-medium uppercase leading-4 text-gray-400">établissements</th>
            <th className="w-[20%] text-xs font-medium uppercase leading-4 text-gray-400">volontaires</th>
          </tr>
        </thead>
        <tbody className="">
          {isLoading ? (
            Array.from(Array(PAGE_SIZE).keys()).map((i) => (
              <tr key={`LoadingSchool${i}`} className="flex h-1/6 items-center border-b-[1px] border-gray-100">
                <td className="w-[80%]">
                  <Loading width="w-[50%]" />
                </td>
                <td className="w-[20%]">
                  <Loading width="w-[50%]" />
                </td>
              </tr>
            ))
          ) : !noResult ? (
            youngBySchool?.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)?.map((school) => (
              <tr key={school?.key} className="flex h-1/6 cursor-default items-center border-b-[1px] border-gray-100 py-3 hover:bg-gray-50">
                <td className="flex w-[80%] flex-col gap-1">
                  <p className="w-[90%] truncate text-sm font-bold leading-6 text-gray-900">{school.schoolName}</p>
                  <p className="text-xs leading-4 text-gray-500">
                    {school?.schoolCity} • {school.schoolZip}
                  </p>
                </td>

                <td className="flex w-[20%] flex-col gap-1 ">
                  <span className="text-sm leading-3 text-gray-500">
                    <span className="font-bold text-gray-900">{school.total}</span> (dont {school.inDepartment} au sein
                  </span>
                  <span className="text-sm leading-3 text-gray-500"> du département)</span>
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
      <div className="flex w-full items-center justify-between pt-4">
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
