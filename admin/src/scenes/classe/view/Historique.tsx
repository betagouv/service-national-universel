import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { HiArrowRight, HiFilter, HiTrash, HiSearch } from "react-icons/hi";
import { LuHistory } from "react-icons/lu";

import { Page, Container, Select } from "@snu/ds/admin";
import api from "@/services/api";
import Loader from "@/components/Loader";
import { capture } from "@/sentry";
import { translate } from "snu-lib";

import ClasseHeader from "../header/ClasseHeader";
import { ClassePatchesType } from "../components/types";
import HistoryRow from "../components/HistoryRow";
import { getPathOptions, getActionOptions, getUserOptions } from "../utils";

export default function Historique(props) {
  const [classe, setClasse] = useState(props.classe);
  const studentStatus = props.studentStatus;
  const [isLoading, setIsLoading] = useState(false);
  const [isNoPatches, setIsNoPatches] = useState(false);
  const [patches, setPatches] = useState<ClassePatchesType[]>([]);
  const [pathFilter, setPathFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const filteredPatches = getFilteredPatches(patches);
  const pathOptions = getPathOptions(patches);
  const actionOptions = getActionOptions(patches);
  const userOptions = getUserOptions(patches);

  const getPatches = async () => {
    try {
      const { ok, code, data } = await api.get(`/cle/classe/${classe._id}/patches`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'historique", translate(code));
      }
      data.forEach((patch) => {
        patch.ops = patch.ops.filter((op) => typeof op.value !== "object");
      });
      setPatches(data);
      if (!data.length) setIsNoPatches(true);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de l'historique", translate(e.message));
    }
  };

  useEffect(() => {
    if (classe?._id) getPatches();
  }, [classe]);

  function getFilteredPatches(patches: ClassePatchesType[]) {
    let filteredPatches = patches;
    if (pathFilter !== "") {
      filteredPatches = filteredPatches.map((patch) => {
        const filteredOps = patch.ops.filter((op) => op.path === pathFilter);

        return {
          ...patch,
          ops: filteredOps,
        };
      });
    }
    if (actionFilter !== "") {
      filteredPatches = filteredPatches.map((patch) => {
        const filteredOps = patch.ops.filter((op) => op.op === actionFilter);

        return {
          ...patch,
          ops: filteredOps,
        };
      });
    }
    if (userFilter !== "") {
      filteredPatches = filteredPatches.filter((patch) => patch.user?.firstName === userFilter);
    }
    return filteredPatches;
  }

  if (!classe) return <Loader />;

  return (
    <Page>
      <ClasseHeader classe={classe} setClasse={setClasse} isLoading={isLoading} setIsLoading={setIsLoading} studentStatus={studentStatus} page={"Historique"} />
      <Container className="!px-0 !pb-0">
        {patches.length === 0 ? (
          <Loader />
        ) : isNoPatches ? (
          <div className="bg-gray-50 mx-8 h-[500px] flex flex-col justify-center items-center">
            <LuHistory size={64} className="text-gray-400 mb-8" strokeWidth="1" />
            <p className="text-base leading-5 text-gray-400">Aucun historique trouvé pour cette classe.</p>
          </div>
        ) : (
          <>
            <FilterComponent
              pathFilter={pathFilter}
              setPathFilter={setPathFilter}
              actionFilter={actionFilter}
              setActionFilter={setActionFilter}
              userFilter={userFilter}
              setUserFilter={setUserFilter}
              pathOptions={pathOptions}
              actionOptions={actionOptions}
              userOptions={userOptions}
            />
            <table className="mt-6 mb-2 flex w-full flex-col table-auto divide-y divide-gray-200 border-gray-100">
              <thead>
                <tr className="flex items-center py-2 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 cursor-default">
                  <span className="w-[30%]">Action</span>
                  <span className="w-[23%]">Avant</span>
                  <span className="flex items-center gap-2 w-[23%]">
                    <HiArrowRight size={16} className="mt-0.5" /> Après
                  </span>
                  <span className="w-[23%]">Auteur</span>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatches.map((hit) => (
                  <HistoryRow key={hit._id} patch={hit} type={"classe"} />
                ))}
              </tbody>
            </table>
          </>
        )}
      </Container>
    </Page>
  );
}

function FilterComponent({ pathFilter, setPathFilter, actionFilter, setActionFilter, userFilter, setUserFilter, pathOptions, actionOptions, userOptions }) {
  const isFilterActive = pathFilter !== "" || actionFilter !== "" || userFilter !== "";
  const [placeholder, setPlaceholder] = useState("Donnée modifiée");
  const [menuClosed, setMenuClosed] = useState(false);

  return (
    <div className="flex items-center justify-center w-full gap-3 text-gray-400 px-6 py-2">
      <div className="flex items-center gap-2 w-[10%]">
        <HiFilter size={20} className={`mt-0.5 ${isFilterActive ? "text-blue-600" : "text-gray-400"}`} />
        <p className={`${isFilterActive ? "text-blue-600" : "text-gray-500"}`}>Filter par : </p>
      </div>
      <Select
        className="w-[30%]"
        size="md"
        badge={placeholder === "Rechercher..." ? <HiSearch size={20} className="mt-2 ml-2" /> : undefined}
        badgePosition="left"
        key={menuClosed.toString()}
        maxMenuHeight={400}
        isActive={pathFilter !== ""}
        placeholder={placeholder}
        onMenuOpen={() => setPlaceholder("Rechercher...")}
        onMenuClose={() => {
          setPlaceholder("Donnée modifiée");
          setMenuClosed((prev) => !prev);
        }}
        options={pathOptions}
        closeMenuOnSelect={true}
        isClearable={true}
        isSearchable={true}
        value={pathOptions.find((option) => option.value === pathFilter) || null}
        onChange={(option) => {
          if (!option) return setPathFilter("");
          setPathFilter(option.value);
        }}
      />
      <Select
        className="w-[30%]"
        key={Math.random()}
        isActive={actionFilter !== ""}
        placeholder={"Type d'action"}
        options={actionOptions}
        closeMenuOnSelect={true}
        isClearable={true}
        isSearchable={false}
        value={actionOptions.find((option) => option.value === actionFilter) || null}
        onChange={(option) => {
          if (!option) return setActionFilter("");
          setActionFilter(option.value);
        }}
      />
      <Select
        className="w-[30%]"
        key={Math.random()}
        isActive={userFilter !== ""}
        placeholder={"Auteur"}
        options={userOptions}
        closeMenuOnSelect={true}
        isClearable={true}
        isSearchable={false}
        value={userOptions.find((option) => option.value === userFilter) || null}
        onChange={(option) => {
          if (!option) return setUserFilter("");
          setUserFilter(option.value);
        }}
      />
      {isFilterActive && (
        <button
          onClick={() => {
            setPathFilter("");
            setActionFilter("");
            setUserFilter("");
          }}>
          <HiTrash size={20} className="mt-0.5 text-red-500 hover:text-red-400 cursor-pointer" />
        </button>
      )}
    </div>
  );
}
