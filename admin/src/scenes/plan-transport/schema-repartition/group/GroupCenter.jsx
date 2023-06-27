import React, { useEffect, useState } from "react";
import { GroupBox, GroupHeader, Loading } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import ArrowNarrowLeft from "../../../../assets/icons/ArrowNarrowLeft";
import api from "../../../../services/api";
import { capture } from "../../../../sentry";

const RELOAD_TIMEOUT = 300;

export default function GroupCenter({ group, className = "", onChangeStep, onChange }) {
  const [filter, setFilter] = useState("");
  const [type, setType] = useState("all");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeDropdownOpened, setTypeDropdownOpened] = useState(false);
  const [filterTimer, setFilterTimer] = useState(null);

  useEffect(() => {
    if (filterTimer) {
      clearTimeout(filterTimer);
    }
    setFilterTimer(setTimeout(filterChanged, RELOAD_TIMEOUT));
  }, [filter, type]);

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
        `/schema-de-repartition/centers/${group.fromDepartment}/${group.cohort}?minPlacesCount=${type === "all" ? 0 : group.youngsVolume}&filter=${encodeURIComponent(
          filter,
        )}&intra=${group.intradepartmental}`,
      );
      if (result.ok) {
        setList(result.data);
      } else {
        setError("Impossible de récupérer la liste des centres. Veuillez réessayer dans quelques instants.");
      }
    } catch (err) {
      capture(err);
      setError("Impossible de récupérer la liste des centres. Veuillez réessayer dans quelques instants.");
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
      <div className="mb-5 flex items-center justify-between">
        <input
          type="text"
          className="appearance-none rounded-lg border border-gray-300 bg-[#FFFFFF] py-3 px-5 text-sm text-gray-600"
          placeholder="Rechercher un centre..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="relative" onClick={() => setTypeDropdownOpened(!typeDropdownOpened)}>
          <div className="flex cursor-pointer items-center p-2.5 text-sm text-gray-700 hover:text-blue-600">
            {type === "all" ? "Voir tout" : "Places disponibles"} <ChevronDown className="ml-3 h-[6px] w-[10px]" />
          </div>
          {typeDropdownOpened && (
            <div className="absolute right-[0px] z-10 whitespace-nowrap rounded-md bg-[#FFFFFF] text-sm shadow">
              <div className={`px-4 py-2 ${type === "all" ? "text-gray-500" : "cursor-pointer whitespace-nowrap text-gray-700"}`} onClick={() => setType("all")}>
                Voir tout
              </div>
              <div className={`px-4 py-2 ${type === "available" ? "text-gray-500" : "cursor-pointer whitespace-nowrap text-gray-700"}`} onClick={() => setType("available")}>
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
              <div
                key={center.name}
                className={`group border-t border-t-gray-200 p-4 ${center._id === group.centerId ? "bg-gray-200" : ""} flex items-center justify-between hover:bg-gray-200`}>
                <div className="">
                  <div className="pb-2.5 text-base font-bold text-[#242526]">{center.name}</div>
                  <div className="text-xs text-[#738297]">
                    {center.city} • {center.department}
                  </div>
                </div>
                <div
                  className={`block rounded px-1.5 text-xs font-bold uppercase leading-5 group-hover:hidden ${
                    center.placesTotal < group.youngsVolume ? (center.placesTotal <= 0 ? "bg-gray-200 text-gray-700" : "bg-red-200 text-red-700") : "bg-[#E8EDFF] text-[#0063CB]"
                  }`}>
                  {center.placesTotal > 0 ? center.placesTotal + " places" : "COMPLET"}
                </div>
                <div
                  className={`hidden h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full bg-blue-600 text-[#FFFFFF] group-hover:flex`}
                  onClick={() => selectCenter(center)}>
                  <ArrowNarrowLeft className="rotate-180" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </GroupBox>
  );
}
