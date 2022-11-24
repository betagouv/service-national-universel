import React, { useEffect, useState } from "react";
import { GroupBox, GroupHeader, Loading } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import ArrowNarrowLeft from "../../../../assets/icons/ArrowNarrowLeft";
import api from "../../../../services/api";
import { capture } from "../../../../sentry";

const LIMIT_BY_PAGES = 10;
const RELOAD_TIMEOUT = 300;

export default function GroupCenter({ group, className = "", onChangeStep, onChange }) {
  const [filter, setFilter] = useState("");
  const [type, setType] = useState("all");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [typeDropdownOpened, setTypeDropdownOpened] = useState(false);
  const [filterTimer, setFilterTimer] = useState(null);

  useEffect(() => {
    const pagination = [];
    for (let i = 0; i < pagesCount; ++i) {
      pagination.push(
        <div key={"page-" + i} className={`text-[14px] font-medium p-4 border-t ${i === page ? "border-t-[#2563EB] text-[#2563EB]" : "border-t-[transparent] text-[#6B7280]"}`}>
          {i + 1}
        </div>,
      );
    }
    setPagination(pagination);
  }, [page, pagesCount]);

  useEffect(() => {
    if (filterTimer) {
      clearTimeout(filterTimer);
    }
    setFilterTimer(setTimeout(filterChanged, RELOAD_TIMEOUT));
  }, [filter, type, page]);

  useEffect(() => {
    return () => {
      if (filterTimer) {
        clearTimeout(filterTimer);
      }
    };
  }, []);

  function filterChanged() {
    setFilterTimer(null);
    loadList();
  }

  async function loadList() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get(
        `/schema-de-repartition/centers/${group.fromDepartment}/${group.cohort}?page=${page}&limit=${LIMIT_BY_PAGES}&minPlacesCount=${
          type === "all" ? 0 : group.youngsVolume
        }&filter=${encodeURIComponent(filter)}`,
      );
      if (result.ok) {
        setList(result.data.centers);
        setPagesCount(result.data.pagesCount);
        if (page >= result.data.pagesCount) {
          setPage(Math.max(0, result.data.pagesCount - 1));
        }
      } else {
        setError("Impossible de récupérer la liste des centres. Veuillez essayer dans quelques instants.");
      }
    } catch (err) {
      capture(err);
      setError("Impossible de récupérer la liste des centres. Veuillez essayer dans quelques instants.");
    }
    setLoading(false);
  }

  function selectCenter(center) {
    onChange(
      {
        ...group,
        centerId: center._id,
        centerName: center.name,
        centerCity: center.city,
        sessionId: center.sessionId,
        toDepartment: center.department,
        toRegion: center.region,
      },
      GROUPSTEPS.GATHERING_PLACES,
    );
  }

  return (
    <GroupBox className={className}>
      <GroupHeader onBack={() => onChangeStep(GROUPSTEPS.MODIFICATION)}>Choisissez un centre</GroupHeader>
      <div className="flex items-center justify-between mb-5">
        <input
          type="text"
          className="appearance-none bg-[#FFFFFF] text-sm text-gray-600 py-3 px-5 border border-gray-300 rounded-lg"
          placeholder="Rechercher un centre..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="relative" onClick={() => setTypeDropdownOpened(!typeDropdownOpened)}>
          <div className="p-2.5 text-sm text-gray-700 flex items-center hover:text-blue-600 cursor-pointer">
            {type === "all" ? "Voir tout" : "Places disponibles"} <ChevronDown className="w-[10px] h-[6px] ml-3" />
          </div>
          {typeDropdownOpened && (
            <div className="absolute bg-[#FFFFFF] shadow rounded-md text-sm right-[0px]">
              <div className={`px-4 py-2 ${type === "all" ? "text-gray-500" : "text-gray-700 cursor-pointer whitespace-nowrap"}`} onClick={() => setType("all")}>
                Voir tout
              </div>
              <div className={`px-4 py-2 ${type === "available" ? "text-gray-500" : "text-gray-700 cursor-pointer whitespace-nowrap"}`} onClick={() => setType("available")}>
                Places disponibles uniquement
              </div>
            </div>
          )}
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="text-[#DC5318]">{error}</div>
      ) : (
        <>
          <div className="">
            {list.map((center) => (
              <div key={center.name} className="group border-t border-t-gray-200 p-4 hover:bg-gray-200 flex items-center justify-between">
                <div className="">
                  <div className="text-base text-[#242526] font-bold pb-2.5">{center.name}</div>
                  <div className="text-xs text-[#738297]">
                    {center.city} • {center.department}
                  </div>
                </div>
                <div
                  className={`block group-hover:hidden text-xs leading-5 font-bold px-1.5 rounded uppercase ${
                    center.placesTotal < group.youngsVolume ? (center.placesTotal <= 0 ? "text-gray-700 bg-gray-200" : "text-red-700 bg-red-200") : "text-[#0063CB] bg-[#E8EDFF]"
                  }`}>
                  {center.placesTotal > 0 ? center.placesTotal + " places" : "COMPLET"}
                </div>
                <div
                  className={`hidden group-hover:flex w-[32px] h-[32px] bg-blue-600 rounded-full text-[#FFFFFF] items-center justify-center cursor-pointer`}
                  onClick={() => selectCenter(center)}>
                  <ArrowNarrowLeft className="rotate-180" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center border-t border-t-gray-200">{pagination}</div>
        </>
      )}
    </GroupBox>
  );
}
