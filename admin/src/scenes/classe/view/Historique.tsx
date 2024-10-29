import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { HiArrowRight, HiFilter, HiTrash } from "react-icons/hi";

import { Page, Container, Select } from "@snu/ds/admin";
import api from "@/services/api";
import Loader from "@/components/Loader";
import { capture } from "@/sentry";
import { translate, formatLongDateFR, translateAction } from "snu-lib";
import { translateHistory, translateModelFields } from "@/utils";
import UserCard from "@/components/UserCard";

import ClasseHeader from "../header/ClasseHeader";
import { ClassePatchesType } from "../components/types";

interface SelectOption {
  value: string;
  label: string;
}

export default function Historique(props) {
  const [classe, setClasse] = useState(props.classe);
  const studentStatus = props.studentStatus;
  const [isLoading, setIsLoading] = useState(false);
  const [patches, setPatches] = useState<ClassePatchesType[]>([]);
  const [filteredPatches, setFilteredPatches] = useState<ClassePatchesType[]>([]);
  const [pathFilter, setPathFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [pathOptions, setPathOptions] = useState<SelectOption[]>([]);
  const [actionOptions, setActionOptions] = useState<SelectOption[]>([]);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);

  const getPatches = async () => {
    try {
      const { ok, code, data } = await api.get(`/cle/classe/${classe._id}/patches`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'historique", translate(code));
      }
      setPatches(data);
      setFilteredPatches(data);

      const pathOptions: SelectOption[] = data.flatMap((patch) =>
        patch.ops.map((op) => ({
          value: op.path,
          label: translateModelFields("classe", op.path.slice(1)),
        })),
      );
      const uniquePathOptions: SelectOption[] = Array.from(new Map(pathOptions.map((item) => [item.value, item])).values());
      setPathOptions(uniquePathOptions);

      const actionOptions: SelectOption[] = data.flatMap((patch) =>
        patch.ops.map((op) => ({
          value: op.op,
          label: translateAction(op.op),
        })),
      );
      const uniqueActionOptions: SelectOption[] = Array.from(new Map(actionOptions.map((item) => [item.value, item])).values());
      setActionOptions(uniqueActionOptions);

      const userOptions: SelectOption[] = data.flatMap((patch) => {
        if (!patch.user || !patch.user.lastName) return [];
        return {
          value: patch.user.firstName,
          label: patch.user.lastName ? `${patch.user.firstName} ${patch.user.lastName}` : patch.user.firstName,
        };
      });
      const uniqueUserOptions: SelectOption[] = Array.from(new Map(userOptions.map((item) => [item.value, item])).values());
      setUserOptions(uniqueUserOptions);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de l'historique", translate(e.message));
    }
  };

  useEffect(() => {
    if (classe?._id) getPatches();
  }, [classe]);

  useEffect(() => {
    let filteredData = patches;
    if (pathFilter !== "") {
      filteredData = filteredData.map((patch) => {
        const filteredOps = patch.ops.filter((op) => op.path === pathFilter);

        return {
          ...patch,
          ops: filteredOps,
        };
      });
    }
    if (actionFilter !== "") {
      filteredData = filteredData.map((patch) => {
        const filteredOps = patch.ops.filter((op) => op.op === actionFilter);

        return {
          ...patch,
          ops: filteredOps,
        };
      });
    }
    if (userFilter !== "") {
      filteredData = filteredData.filter((patch) => patch.user?.firstName === userFilter);
    }
    setFilteredPatches(filteredData);
  }, [pathFilter, actionFilter, userFilter, patches]);

  if (!classe || !patches.length) return <Loader />;

  return (
    <Page>
      <ClasseHeader classe={classe} setClasse={setClasse} isLoading={isLoading} setIsLoading={setIsLoading} studentStatus={studentStatus} page={"Historique"} />
      <Container className="!px-0 !pb-0">
        <FilterComponent
          pathFilter={pathFilter}
          setPathFilter={setPathFilter}
          actionFilter={actionFilter}
          setActionFilter={setActionFilter}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          uniquePathOptions={pathOptions}
          actionOptions={actionOptions}
          uniqueUserOptions={userOptions}
        />
        <table className="mt-6 mb-2 flex w-full flex-col table-auto divide-y divide-gray-200 border-gray-100">
          <thead>
            <tr className="flex items-center py-2 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 ">
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
              //@ts-ignore
              <HistoryRow key={hit._id} patch={hit} />
            ))}
          </tbody>
        </table>
      </Container>
    </Page>
  );
}

function FilterComponent({ pathFilter, setPathFilter, actionFilter, setActionFilter, userFilter, setUserFilter, uniquePathOptions, actionOptions, uniqueUserOptions }) {
  const isFilterActive = pathFilter !== "" || actionFilter !== "" || userFilter !== "";

  return (
    <div className="flex items-center justify-center w-full gap-3 text-gray-400 px-6 py-2">
      <div className={`flex items-center gap-2 w-[10%] ${isFilterActive ? "text-blue-600" : ""}`}>
        <HiFilter size={20} className="mt-0.5" />
        <p>Filter par : </p>
      </div>
      <Select
        className="w-[30%]"
        maxMenuHeight={400}
        key={Math.random()}
        isActive={pathFilter !== ""}
        placeholder={"Donnée modifiée"}
        options={uniquePathOptions}
        closeMenuOnSelect={true}
        isClearable={true}
        isSearchable={false}
        value={uniquePathOptions.find((option) => option.value === pathFilter) || null}
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

function HistoryRow({ patch }) {
  return (
    <>
      {patch.ops.map((op, index) => (
        <tr key={index} className="flex cursor-default items-center px-4 py-3 hover:bg-slate-50">
          <td className="w-[30%]">
            <p className="truncate hover:overflow-visible text-gray-900 font-[700] text-base leading-5">{translateModelFields("classe", op.path.slice(1))}</p>
            <p className="text-gray-500">
              {translateAction(op.op)} • {formatLongDateFR(patch.date)}
            </p>
          </td>
          <td className="w-[23%]">
            <p className="truncate text-gray-400 text-sm leading-5">{translateHistory(op.path, op.originalValue)}</p>
          </td>
          <td className="w-[23%] flex items-center gap-2">
            <HiArrowRight size={16} className="mt-0.5" />
            <p className="truncate text-gray-900">{translateHistory(op.path, op.value)}</p>
          </td>
          <td className="w-[23%]">
            <UserCard user={patch.user} />
          </td>
        </tr>
      ))}
    </>
  );
}
