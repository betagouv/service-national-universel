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
import { ClasseYoungPatchesType } from "../components/types";
import HistoryRow from "../components/HistoryRow";
import { getValueOptions, getUserOptions, getYoungOptions, NormalizeYoungName } from "../utils";

export default function Inscriptions(props) {
  const [classe, setClasse] = useState(props.classe);
  const studentStatus = props.studentStatus;
  const [isLoading, setIsLoading] = useState(true);
  const [isPatches1Done, setIsPatches1Done] = useState(false);
  const [isPatches2Done, setIsPatches2Done] = useState(false);
  const [patches, setPatches] = useState<ClasseYoungPatchesType[]>([]);
  const [oldYoungPatches, setOldYoungPatches] = useState<ClasseYoungPatchesType[]>([]);
  const allPatches = [...patches, ...oldYoungPatches];
  const isNoYoung = allPatches.length === 0 && isPatches1Done && isPatches2Done;
  const [youngFilter, setYoungFilter] = useState("");
  const [valueFilter, setValueFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const filteredPatches = getFilteredPatches(allPatches);
  const youngOptions = getYoungOptions(allPatches);
  const valueOptions = getValueOptions(patches);
  const userOptions = getUserOptions(allPatches);

  const getPatches = async () => {
    try {
      const { ok, code, data } = await api.get(`/cle/young/by-classe-historic/${classe._id}/patches`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'historique", translate(code));
      }
      setPatches(data);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de l'historique", translate(e.message));
    } finally {
      setIsPatches1Done(true);
    }
  };

  const getOldPatches = async () => {
    try {
      const { ok, code, data } = await api.get(`/cle/young/by-classe-historic/${classe._id}/patches/old-student`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'historique", translate(code));
      }
      setOldYoungPatches(data);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de l'historique", translate(e.message));
    } finally {
      setIsPatches2Done(true);
    }
  };

  useEffect(() => {
    if (classe?._id) {
      getPatches();
      getOldPatches();
    }
  }, [classe]);

  useEffect(() => {
    if (isPatches1Done && isPatches2Done) {
      setIsLoading(false);
    }
  }, [isPatches1Done, isPatches2Done]);

  function getFilteredPatches(patches: ClasseYoungPatchesType[]) {
    let filteredPatches = patches;
    if (youngFilter !== "") {
      filteredPatches = filteredPatches.filter((patch) => {
        const fullName = NormalizeYoungName(`${patch.young.firstName} ${patch.young.lastName}`);
        const filter = NormalizeYoungName(youngFilter);

        return fullName.includes(filter);
      });
    }
    if (valueFilter !== "") {
      filteredPatches = filteredPatches.map((patch) => {
        const filteredOps = patch.ops.filter((op) => op.value === valueFilter);

        return {
          ...patch,
          ops: filteredOps,
        };
      });
    }
    if (userFilter !== "") {
      filteredPatches = filteredPatches.filter((patch) => patch.user?.firstName === userFilter);
    }
    filteredPatches = filteredPatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return filteredPatches;
  }

  if (!classe) return <Loader />;

  return (
    <Page>
      <ClasseHeader classe={classe} setClasse={setClasse} isLoading={isLoading} setIsLoading={setIsLoading} studentStatus={studentStatus} page={"Inscriptions"} />
      <Container className="!px-0">
        {isNoYoung ? (
          <div className="bg-gray-50 mx-8 h-[500px] flex flex-col justify-center items-center">
            <LuHistory size={64} className="text-gray-400 mb-8" strokeWidth="1" />
            <p className="text-base leading-5 text-gray-400">Il n'y a aucun élève inscrit dans cette classe</p>
          </div>
        ) : isLoading ? (
          <Loader />
        ) : (
          <>
            <FilterComponent
              youngFilter={youngFilter}
              setYoungFilter={setYoungFilter}
              valueFilter={valueFilter}
              setValueFilter={setValueFilter}
              userFilter={userFilter}
              setUserFilter={setUserFilter}
              youngOptions={youngOptions}
              valueOptions={valueOptions}
              uniqueUserOptions={userOptions}
            />
            <table className="mt-6 mb-2 flex w-full flex-col table-auto divide-y divide-gray-200 border-gray-100">
              <thead>
                <tr className="flex items-center py-2 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 cursor-default ">
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
                  <HistoryRow key={hit._id} patch={hit} type={"young"} />
                ))}
              </tbody>
            </table>
          </>
        )}
      </Container>
    </Page>
  );
}

function FilterComponent({ youngFilter, setYoungFilter, valueFilter, setValueFilter, userFilter, setUserFilter, youngOptions, valueOptions, uniqueUserOptions }) {
  const isFilterActive = youngFilter !== "" || valueFilter !== "" || userFilter !== "";
  const [placeholder, setPlaceholder] = useState("Élève modifié");
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
        isActive={youngFilter !== ""}
        placeholder={placeholder}
        onMenuOpen={() => setPlaceholder("Rechercher...")}
        onMenuClose={() => {
          setPlaceholder("Élève modifié");
          setMenuClosed((prev) => !prev);
        }}
        options={youngOptions}
        closeMenuOnSelect={true}
        isClearable={true}
        isSearchable={true}
        value={youngOptions.find((option) => option.value === youngFilter) || null}
        onChange={(option) => {
          if (!option) return setYoungFilter("");
          setYoungFilter(option.value);
        }}
      />
      <Select
        className="w-[30%]"
        key={Math.random()}
        isActive={valueFilter !== ""}
        placeholder={"Statut d'inscription"}
        options={valueOptions}
        closeMenuOnSelect={true}
        isClearable={true}
        isSearchable={false}
        value={valueOptions.find((option) => option.value === valueFilter) || null}
        onChange={(option) => {
          if (!option) return setValueFilter("");
          setValueFilter(option.value);
        }}
      />
      <Select
        className="w-[30%]"
        key={Math.random()}
        isActive={userFilter !== ""}
        placeholder={"Auteur"}
        options={uniqueUserOptions}
        closeMenuOnSelect={true}
        isClearable={true}
        isSearchable={false}
        value={uniqueUserOptions.find((option) => option.value === userFilter) || null}
        onChange={(option) => {
          if (!option) return setUserFilter("");
          setUserFilter(option.value);
        }}
      />
      {isFilterActive && (
        <button
          onClick={() => {
            setYoungFilter("");
            setValueFilter("");
            setUserFilter("");
          }}>
          <HiTrash size={20} className="mt-0.5 text-red-500 hover:text-red-400 cursor-pointer" />
        </button>
      )}
    </div>
  );
}
