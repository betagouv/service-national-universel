import React, { useEffect, useState } from "react";
import { GroupBox, GroupHeader, Loading, MiniTitle } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import api from "../../../../services/api";
import { capture } from "../../../../sentry";
import { PlainButton } from "../../components/Buttons";

const RELOAD_TIMEOUT = 300;
const LIST_PAGE_LIMIT = 10;

export default function GroupGatheringPlaces({ group, className = "", onChangeStep, onChange, previousStep }) {
  const [filter, setFilter] = useState("");
  const [type, setType] = useState("department");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState(null);
  const [typeDropdownOpened, setTypeDropdownOpened] = useState(false);
  const [filterTimer, setFilterTimer] = useState(null);
  const [selection, setSelection] = useState([]);
  const [pdrLines, setPdrLines] = useState([]);
  const [gatheringPlacesCount, setGatheringPlacesCount] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

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
    loadList();
  }, [currentPage]);

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

  useEffect(() => {
    if (list && gatheringPlacesCount > list.length) {
      const pagesCount = Math.ceil(gatheringPlacesCount / LIST_PAGE_LIMIT);
      let pages = [];
      for (let i = Math.max(0, currentPage - 3), n = Math.min(pagesCount - 1, currentPage + 3); i < n; ++i) {
        pages.push(i);
      }
      setPagination(
        <div className="flex justify-center border-t border-t-gray-200">
          {pages.map((p) => (
            <div
              key={"page-" + p}
              className={`border-t-2 w-[39px] text-center py-4 cursor-pointer ${currentPage === p ? "border-t-blue-500" : "border-t-[transparent]"} hover:border-t-blue-500`}
              onClick={() => setCurrentPage(p)}>
              {p + 1}
            </div>
          ))}
        </div>,
      );
    } else {
      setPagination(null);
    }
  }, [gatheringPlacesCount, list]);

  function filterChanged() {
    setFilterTimer(null);
    setCurrentPage(0);
    loadList();
  }

  async function loadList() {
    setLoading(loading + 1);
    setError(null);
    try {
      let url = "/schema-de-repartition/pdr";
      if (type !== "all") {
        url += "/" + group.fromDepartment;
      }
      url += "/" + group.cohort;
      url += "?offset=" + currentPage * LIST_PAGE_LIMIT + "&limit=" + LIST_PAGE_LIMIT;
      url += "&filter=" + encodeURIComponent(filter);

      const result = await api.get(url);
      if (result.ok) {
        if (Array.isArray(result.data)) {
          setList(result.data);
          setCurrentPage(0);
          setGatheringPlacesCount(result.data.length);
        } else {
          setList(result.data.gatheringPlaces);
          setGatheringPlacesCount(result.data.total);
        }
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
        const result = await api.post("/schema-de-repartition/get-group-detail", group);
        if (result.ok && result.data.gatheringPlaces) {
          setSelection(result.data.gatheringPlaces);
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

  return (
    <GroupBox className={className}>
      <GroupHeader onBack={() => onChangeStep(previousStep === GROUPSTEPS.MODIFICATION ? GROUPSTEPS.MODIFICATION : GROUPSTEPS.CENTER)}>
        Choisissez les lieux de rassemblements
      </GroupHeader>
      {loading > 0 ? (
        <Loading />
      ) : error ? (
        <div className="text-[#DC5318]">{error}</div>
      ) : (
        <>
          <div className="">
            {pdrLines && pdrLines.length > 0 && (
              <div className="mb-4">
                <MiniTitle>Points de rassemblement sélectionnés</MiniTitle>
                <div className="mt-2">{pdrLines}</div>
              </div>
            )}
          </div>
          <MiniTitle>Choisissez des points de rassemblement</MiniTitle>
          <div className="flex items-center justify-between mb-2 mt-2">
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
                <div className="absolute bg-[#FFFFFF] shadow rounded-md text-sm right-[0px] z-10 whitespace-nowrap">
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
          <div className="">
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
          {pagination}
          <div className="flex justify-end">
            <PlainButton onClick={validate}>Continuer</PlainButton>
          </div>
        </>
      )}
    </GroupBox>
  );
}
