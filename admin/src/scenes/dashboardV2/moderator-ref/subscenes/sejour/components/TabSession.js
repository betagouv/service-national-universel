import React, { useEffect } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineExternalLink } from "react-icons/hi";
import { Link } from "react-router-dom";
import { ES_NO_LIMIT } from "snu-lib";
import api from "../../../../../../services/api";
import { currentFilterAsUrl } from "../../../../components/FilterDashBoard";

const PAGE_SIZE = 6;

export default function TabSession({ sessionList, filters }) {
  const [sessionByCenter, setSessionByCenter] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageMax, setPageMax] = React.useState(0);
  const [noResult, setNoResult] = React.useState(false);
  const [total, setTotal] = React.useState(0);

  const getYoungsBySession = async () => {
    if (sessionList.length === 0) {
      setNoResult(true);
      setPage(0);
      setPageMax(0);
      setTotal(0);
      return;
    }

    const body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        session: {
          terms: { field: "sessionPhase1Id.keyword", size: ES_NO_LIMIT },
          aggs: {
            presence: { terms: { field: "cohesionStayPresence.keyword" } },
            presenceJDM: { terms: { field: "presenceJDM.keyword" } },
          },
        },
      },
      size: 0,
    };

    if (filters.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": filters.status } });
    if (filters.statusPhase1?.length) body.query.bool.filter.push({ terms: { "statusPhase1.keyword": filters.statusPhase1 } });

    let sessionPhase1Id = sessionList.map((session) => session._id).filter((id) => id);
    if (sessionPhase1Id.length) body.query.bool.filter.push({ terms: { "sessionPhase1Id.keyword": sessionPhase1Id } });

    const { responses } = await api.esQuery("young", body);
    if (!responses?.length) return setNoResult(true);

    const sessionAggreg = responses[0].aggregations.session.buckets.reduce((acc, session) => {
      acc[session.key] = {
        total: session.doc_count,
        presence: session.presence.buckets.reduce((acc, presence) => {
          acc[presence.key] = presence.doc_count;
          return acc;
        }, {}),
        presenceJDM: session.presenceJDM.buckets.reduce((acc, presenceJDM) => {
          acc[presenceJDM.key] = presenceJDM.doc_count;
          return acc;
        }, {}),
      };
      return acc;
    }, {});

    const sessionByCenter = sessionList.reduce((acc, session) => {
      if (!acc[session.cohesionCenterId]) {
        acc[session.cohesionCenterId] = {
          centerId: session.cohesionCenterId,
          centerName: session.nameCentre,
          centerCity: session.cityCentre,
          department: session.department,
          region: session.region,
          total: sessionAggreg[session._id]?.total || 0,
          presence: sessionAggreg[session._id]?.presence?.false || 0,
          presenceJDM: sessionAggreg[session._id]?.presenceJDM?.false || 0,
        };
      } else {
        acc[session.cohesionCenterId].total += sessionAggreg[session._id]?.total || 0;
        acc[session.cohesionCenterId].presence += sessionAggreg[session._id]?.presence?.false || 0;
        acc[session.cohesionCenterId].presenceJDM += sessionAggreg[session._id]?.presenceJDM?.false || 0;
      }
      return acc;
    }, {});

    setNoResult(false);
    setPage(0);
    setPageMax(Math.trunc(Object.values(sessionByCenter).length / PAGE_SIZE));
    setTotal(Object.values(sessionByCenter).length);
    //tranform object to array
    setSessionByCenter(Object.values(sessionByCenter));
    setIsLoading(false);
  };

  useEffect(() => {
    if (sessionList) {
      getYoungsBySession(sessionList);
    }
  }, [sessionList]);

  return (
    <div className="flex flex-col gap-5 bg-white rounded-lg shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] px-8 py-8 w-[60%]">
      <div className="flex items-center gap-3">
        <p className="text-base text-left leading-5 font-bold text-gray-900">Liste des centres</p>
        <Link to={`/centre/liste/presence?${currentFilterAsUrl(filters)}`} target={"_blank"}>
          <HiOutlineExternalLink className="h-5 w-5 text-gray-400 cursor-pointer" />
        </Link>
      </div>
      <table className="table-fixed w-full h-full">
        <thead>
          <tr className="flex items-center border-y-[1px] border-gray-100 py-4">
            <th className="w-[40%] uppercase text-xs text-gray-500 font-medium leading-4">centres</th>
            <th className="w-[30%] uppercase text-xs text-gray-500 font-medium leading-4">
              présence non <br />
              renseignée à l’arrivée
            </th>
            <th className="w-[30%] uppercase text-xs text-gray-500 font-medium leading-4">
              présence non <br />
              renseignée à LA JDM
            </th>
          </tr>
        </thead>
        <tbody className="h-full">
          {isLoading ? (
            Array.from(Array(PAGE_SIZE).keys()).map((i) => (
              <tr key={`LoadingCenter${i}`} className="flex items-center border-b-[1px] border-gray-100 h-1/6">
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
            sessionByCenter?.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)?.map((center) => (
              <tr key={center?.name} className="flex items-center border-b-[1px] border-gray-100 py-3 h-1/6">
                <td className="flex flex-col w-[40%] gap-1">
                  <p className="text-sm text-gray-900 font-bold leading-6 truncate">{center.centerName}</p>
                  <p className="text-xs text-gray-500 leading-4">
                    {center?.centerCity} • {center.department}
                  </p>
                </td>
                <td className="w-[30%] text-sm text-gray-500 leading-3">
                  <span className="text-gray-900 font-bold">{center.presence}</span> ({Math.round((center.presence / center.total) * 100) || 0}%)
                </td>
                <td className="w-[30%] text-sm text-gray-500 leading-3">
                  <span className="text-gray-900 font-bold">{center.presenceJDM}</span> ({Math.round((center.presenceJDM / center.total) * 100) || 0}%)
                </td>
              </tr>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm leading-5 font-normal text-gray-700">Aucun résultat</p>
            </div>
          )}
        </tbody>
        <div className="flex items-center border-t-[1px] justify-between border-gray-100 pt-4">
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
      </table>
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
