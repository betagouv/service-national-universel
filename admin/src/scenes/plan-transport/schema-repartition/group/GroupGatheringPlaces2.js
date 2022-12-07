import React, { useEffect, useState } from "react";
import { GroupBox, GroupHeader, Loading } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import api from "../../../../services/api";
import { capture } from "../../../../sentry";
import { PlainButton } from "../../components/Buttons";

const RELOAD_TIMEOUT = 300;

export default function GroupGatheringPlaces2({ group, className = "", onChangeStep, onChange }) {
  const [filter, setFilter] = useState("");
  const [type, setType] = useState("department");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeDropdownOpened, setTypeDropdownOpened] = useState(false);
  const [filterTimer, setFilterTimer] = useState(null);
  const [selection, setSelection] = useState([]);
  const [pdrLines, setPdrLines] = useState([]);

  useEffect(() => {
    if (filterTimer) {
      clearTimeout(filterTimer);
    }
    setFilterTimer(setTimeout(filterChanged, RELOAD_TIMEOUT));
  }, [filter, type]);

  useEffect(() => {
    loadSelected();

    return () => {
      if (filterTimer) {
        clearTimeout(filterTimer);
      }
    };
  }, []);

  useEffect(() => {
    setPdrLines(
      selection.map((pdr) => (
        <div key={pdr._id} className="group border-t border-t-gray-200 p-4 hover:bg-gray-200 flex items-center cursor-pointer" onClick={() => toggleSelection(pdr)}>
          <input type="checkbox" checked={true} readOnly />
          <div className="grow ml-4">
            <div className="text-base text-[#242526] font-bold pb-2.5">{pdr.name}</div>
            <div className="text-xs text-[#738297]">
              {pdr.city} • {pdr.department} • {pdr.code}
            </div>
          </div>
        </div>
      )),
    );
  }, [selection]);

  function filterChanged() {
    setFilterTimer(null);
    loadList();
  }

  async function loadList() {
    setLoading(loading + 1);
    setError(null);
    try {
      const result = await api.get(`/schema-de-repartition/pdr${type === "all" ? "" : "/" + group.fromDepartment}/${group.cohort}`);
      if (result.ok) {
        setList(result.data);
      } else {
        setError("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.");
      }
    } catch (err) {
      capture(err);
      setError("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.");
    }
    setLoading(loading - 1);
  }

  async function loadSelected() {
    setLoading(loading + 1);
    setError(null);
    if (group.gatheringPlaces && group.gatheringPlaces.length > 0) {
      try {
        const result = await api.get(`/schema-de-repartition/pdr-list?list=${group.gatheringPlaces.join(",")}`);
        if (result.ok) {
          setSelection(result.data);
        } else {
          setError("Impossible de récupérer la liste des points de rassemblement sélectionnés. Veuillez essayer dans quelques instants.");
        }
      } catch (err) {
        capture(err);
        setError("Impossible de récupérer la liste des points de rassemblement sélectionnés. Veuillez essayer dans quelques instants.");
      }
    }
    setLoading(false);
  }

  function toggleSelection(pdr) {
    const index = selection.findIndex((gp) => {
      return gp._id === pdr._id;
    });

    const newSelection = [...selection];
    if (index >= 0) {
      newSelection.splice(index, 1);
    } else {
      newSelection.push(pdr);
    }
    setSelection(newSelection);
  }

  function isSelected(pdr) {
    return (
      selection.findIndex((gp) => {
        return gp._id === pdr._id;
      }) >= 0
    );
  }

  function validate() {
    onChange(
      {
        ...group,
        gatheringPlaces: selection.map((s) => s._id),
      },
      GROUPSTEPS.AFFECTATION_SUMMARY,
    );
  }
  //
  // function selectCenter(center) {
  //   onChange(
  //     {
  //       ...group,
  //       centerId: center._id,
  //       centerName: center.name,
  //       centerCity: center.city,
  //       sessionId: center.sessionId,
  //       toDepartment: center.department,
  //       toRegion: center.region,
  //     },
  //     GROUPSTEPS.GATHERING_PLACES,
  //   );
  // }

  return (
    <GroupBox className={className}>
      <GroupHeader onBack={() => onChangeStep(GROUPSTEPS.CENTER)}>Choisissez les lieux de rassemblements</GroupHeader>
      <div className="flex items-center justify-between mb-5">
        <input
          type="text"
          className="appearance-none bg-[#FFFFFF] text-sm text-gray-600 py-3 px-5 border border-gray-300 rounded-lg"
          placeholder="Rechercher un lieu..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="relative" onClick={() => setTypeDropdownOpened(!typeDropdownOpened)}>
          <div className="p-2.5 text-sm text-gray-700 flex items-center hover:text-blue-600 cursor-pointer">
            {type === "all" ? "Voir tout" : "Mon département"} <ChevronDown className="w-[10px] h-[6px] ml-3" />
          </div>
          {typeDropdownOpened && (
            <div className="absolute bg-[#FFFFFF] shadow rounded-md text-sm right-[0px]">
              <div className={`px-4 py-2 ${type === "all" ? "text-gray-500" : "text-gray-700 cursor-pointer whitespace-nowrap"}`} onClick={() => setType("all")}>
                Voir tout
              </div>
              <div className={`px-4 py-2 ${type === "available" ? "text-gray-500" : "text-gray-700 cursor-pointer whitespace-nowrap"}`} onClick={() => setType("available")}>
                Mon département uniquement
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
            <div className="">{pdrLines}</div>
            <div>
              {list.map((pdr) => {
                return isSelected(pdr) ? null : (
                  <div key={pdr._id} className="group border-t border-t-gray-200 p-4 hover:bg-gray-200 flex items-center cursor-pointer" onClick={() => toggleSelection(pdr)}>
                    <input type="checkbox" checked={false} readOnly />
                    <div className="grow ml-4">
                      <div className="text-base text-[#242526] font-bold pb-2.5">{pdr.name}</div>
                      <div className="text-xs text-[#738297]">
                        {pdr.city} • {pdr.department} • {pdr.code}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <PlainButton onClick={validate}>Continuer</PlainButton>
            </div>
          </div>
        </>
      )}
    </GroupBox>
  );
}
