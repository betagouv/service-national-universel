import React, { useEffect } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ES_NO_LIMIT, ROLES } from "snu-lib";
import api from "../../../../services/api";
import { replaceSpaces } from "../../../../utils";

const PAGE_SIZE = 6;

export default function TabSchool({ filters }) {
  const [youngBySchool, setYoungBySchool] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageMax, setPageMax] = React.useState(0);
  const [noResult, setNoResult] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [noFilterDepartement, setNoFilterDepartement] = React.useState(false);
  const user = useSelector((state) => state.Auth.user);

  const fetchYoungByschool = async () => {
    setYoungBySchool(null);
    setNoResult(false);
    setTotal(0);
    setPageMax(0);
    setIsLoading(true);
    if (!filters.region?.length && !filters.department?.length && !filters.academy?.length && user.role === ROLES.ADMIN) {
      setNoFilterDepartement(true);
      setNoResult(true);
      setIsLoading(false);

      return;
    } else {
      setNoFilterDepartement(false);
    }

    const body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        school: {
          terms: { field: "schoolId.keyword", size: ES_NO_LIMIT },
          aggs: { departments: { terms: { field: "department.keyword" } }, firstUser: { top_hits: { size: 1 } } },
        },
      },
      size: 0,
      track_total_hits: true,
    };
    if (filters.region?.length) body.query.bool.filter.push({ terms: { "schoolRegion.keyword": filters.region } });
    if (filters.department?.length) body.query.bool.filter.push({ terms: { "schoolDepartment.keyword": filters.department } });
    if (filters.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filters.cohort } });

    let route = "young";
    if (user.role === ROLES.REFERENT_DEPARTMENT) route = "young-having-school-in-department/inscriptions";
    if (user.role === ROLES.REFERENT_REGION) route = "young-having-school-in-region/inscriptions";

    const { responses } = await api.esQuery("young", body, route);
    if (!responses?.length) return setNoResult(true);
    if (setNoResult(responses[0].aggregations.school.buckets.length === 0)) {
      setNoResult(true);
      setIsLoading(false);
      return;
    }

    let reducedSchool = responses[0]?.aggregations?.school?.buckets?.reduce((acc, school) => {
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
    <div className="flex flex-col gap-5 w-[60%] bg-white rounded-lg px-8 py-8">
      <div className="flex flex-row justify-between w-full">
        <div className="text-base font-bold text-gray-900">Liste des établissements</div>
        <div className="text-xs text-gray-600">
          Export depuis le menu{" "}
          <Link
            to={`/inscription`}
            target="_blank"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-blue-600 cursor-pointer">
            Inscriptions
          </Link>
        </div>
      </div>
      <table className={`table-fixed w-full ${isLoading || noFilterDepartement || noResult ? "h-full" : ""}`}>
        <thead>
          <tr className="flex items-center border-y-[1px] border-gray-100 py-4">
            <th className="w-[70%] uppercase text-xs text-gray-500 font-medium leading-4">établissements</th>
            <th className="w-[30%] uppercase text-xs text-gray-500 font-medium leading-4">volontaires</th>
          </tr>
        </thead>
        <tbody className="">
          {isLoading ? (
            Array.from(Array(PAGE_SIZE).keys()).map((i) => (
              <tr key={`LoadingSchool${i}`} className="flex items-center border-b-[1px] border-gray-100 h-1/6">
                <td className="w-[70%]">
                  <Loading width="w-[50%]" />
                </td>
                <td className="w-[30%]">
                  <Loading width="w-[50%]" />
                </td>
              </tr>
            ))
          ) : !noResult ? (
            youngBySchool?.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)?.map((school) => (
              <tr key={school?.key} className="flex items-center border-b-[1px] border-gray-100 py-3 h-1/6">
                <td className="flex flex-col w-[70%] gap-1">
                  <Link
                    to={`/inscription?SCHOOL=%5B"${replaceSpaces(school.schoolName)}"%5D`}
                    target="_blank"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="text-blue-600 cursor-pointer">
                    <p className="text-sm text-gray-900 font-bold leading-6 truncate w-[90%]">{school.schoolName}</p>
                    <p className="text-xs text-gray-500 leading-4">
                      {school?.schoolCity} • {school.schoolZip}
                    </p>
                  </Link>
                </td>

                <td className="w-[30%] flex flex-col gap-1 ">
                  <span className="text-sm text-gray-500 leading-3">
                    <span className="text-gray-900 font-bold">{school.total}</span> (dont {school.inDepartment} au sein
                  </span>
                  <span className="text-sm text-gray-500 leading-3"> du département)</span>
                </td>
              </tr>
            ))
          ) : !noFilterDepartement ? (
            <tr className="flex items-center justify-center h-full">
              <td className="text-sm leading-5 font-normal text-gray-700">Aucun résultat</td>
            </tr>
          ) : (
            <tr className="flex items-center justify-center h-full">
              <td className="text-sm leading-5 font-normal text-gray-700">Vous devez filtrer au minimum sur une région / un département pour accéder à cette liste</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between pt-4 w-full">
        <p className="text-sm leading-5 font-normal text-gray-700">
          {noResult ? 0 : page * PAGE_SIZE + 1}-<strong> {page * PAGE_SIZE + PAGE_SIZE >= total ? total : page * PAGE_SIZE + PAGE_SIZE}</strong> sur <strong>{total}</strong>{" "}
          résultats
        </p>
        <div className="flex items-center">
          <button
            className="flex items-center justify-center h-10 w-10 rounded-l-md border-[1px] border-gray-300"
            onClick={() => {
              if (page > 0) setPage(page - 1);
            }}>
            <HiOutlineChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <button
            className="flex items-center justify-center h-10 w-10 rounded-r-md border-r-[1px] border-y-[1px] border-gray-300"
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
    <div className={`animate-pulse flex space-x-4 ${width}`}>
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4 ">
          <div className="h-2 bg-gray-300 rounded col-span-2"></div>
          <div className="h-2 bg-gray-300 rounded col-span-1"></div>
        </div>
      </div>
    </div>
  );
}
