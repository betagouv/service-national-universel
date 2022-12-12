import React, { useState } from "react";
import { formatStringLongDate, translateModelFields, isIsoDate, translateHistory } from "../../utils";
import { formatLongDateFR, translateAction } from "snu-lib";
import FilterIcon from "../../assets/icons/Filter";
import UserCard from "../UserCard";
import MultiSelect from "../../scenes/dashboard/components/MultiSelect";
import { HiOutlineArrowRight } from "react-icons/hi";

export default function Historic({ model, data, customFilterOptions, refName }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [commonFilters, setCommonFilters] = useState({ op: [], user: [], path: [] });
  const [customFilter, setCustomFilter] = useState({ label: "", values: null });
  const activeFilters = getActiveFilters();
  const filteredData = filterData();

  function getActiveFilters() {
    let filters = [];
    for (const [key, value] of Object.entries(commonFilters)) {
      if (value.length) filters.push({ [key]: value });
    }
    if (customFilter?.value) filters.push(customFilter.value);
    return filters;
  }

  function getOptions(key) {
    const arr = data?.map((e) => e[key]);
    return [...new Set(arr)];
  }

  function filterData() {
    let d = data;
    if (activeFilters?.length) d = d.filter((e) => filterEvent(e, activeFilters));
    if (query) d = d.filter((e) => searchEvent(e, query));
    return d;
  }

  function filterEvent(event, filters) {
    return filters.every((filter) => {
      return Object.entries(filter).some(([key, value]) => value.includes(event[key]));
    });
  }

  function searchEvent(e, query) {
    const serializedQuery = query.toLowerCase().trim();
    const matchFieldName = translateModelFields(model, e.path).toLowerCase().includes(serializedQuery);
    const matchOriginalValue = (isIsoDate(e.originalValue) ? formatStringLongDate(e.originalValue) : e.originalValue)?.toLowerCase().includes(serializedQuery);
    const matchFromValue = (isIsoDate(e.value) ? formatStringLongDate(e.value) : e.value)?.toLowerCase().includes(serializedQuery);

    return matchFieldName || matchOriginalValue || matchFromValue;
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-md text-slate-700">
      {!data.length && <div className="italic p-4">Aucune donnée</div>}
      <div className="flex p-4 gap-4">
        <input onChange={(e) => setQuery(e.target.value)} value={query} className="border p-2 rounded-lg w-64 text-xs" placeholder="Rechercher..." />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group py-2 px-3 rounded-lg flex items-center gap-2 ${isOpen ? "bg-gray-500 hover:bg-gray-100" : "bg-gray-100 hover:bg-gray-500"}`}>
          <FilterIcon className={isOpen ? "fill-gray-100 group-hover:fill-gray-500" : "fill-gray-500 group-hover:fill-gray-100"} />
          <p className={isOpen ? "text-gray-100 group-hover:text-gray-500" : "text-gray-500 group-hover:text-gray-100"}>Filtres</p>
        </button>
        {customFilterOptions && <CustomFilters customFilterOptions={customFilterOptions} customFilter={customFilter} setCustomFilter={setCustomFilter} />}
      </div>
      {isOpen && (
        <div className="flex flex-wrap gap-4 p-4 bg-slate-50">
          <MultiSelect
            options={getOptions("path").map((e) => ({ label: translateModelFields(model, e), value: e }))}
            value={commonFilters.path}
            onChange={(path) => setCommonFilters((f) => ({ ...f, ...{ path } }))}
            label="Donnée modifiée"
          />
          <MultiSelect
            options={getOptions("op").map((e) => ({ label: translateAction(e), value: e }))}
            value={commonFilters.op}
            onChange={(op) => setCommonFilters((f) => ({ ...f, ...{ op } }))}
            label="Type d'action"
          />
          <MultiSelect
            options={getOptions("author").map((e) => ({ label: e, value: e }))}
            value={commonFilters.author}
            onChange={(author) => setCommonFilters((f) => ({ ...f, ...{ author } }))}
            label="Auteur de la modification"
          />
        </div>
      )}
      <table className="table-fixed w-full">
        <thead>
          <tr className="uppercase border-t border-t-slate-100">
            {refName && <th className="font-normal px-4 py-3 text-xs text-gray-500">{refName}</th>}
            <th className="font-normal px-4 py-3 text-xs text-gray-500 w-96">Action</th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500 w-80">Détails</th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500 w-16"></th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500 w-80"></th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500 w-auto">Auteur</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((e, index) => (
            <Event key={index} e={e} index={index} model={model} refName={refName} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterButton({ filter, setCustomFilter, customFilter }) {
  const checked = filter.label === customFilter.label;

  function handleChange() {
    if (checked) return setCustomFilter({ label: "", value: null });
    return setCustomFilter(filter);
  }

  return (
    <label className={`text-blue-500 py-2 px-3 m-0 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-slate-50 ${checked && "bg-blue-50"}`}>
      <FilterIcon className="fill-blue-300" />
      {filter.label}
      <input type="checkbox" checked={checked} onChange={() => handleChange()} className="hidden" />
    </label>
  );
}

function CustomFilters({ customFilterOptions, setCustomFilter, customFilter }) {
  return (
    <div className="flex flex-wrap gap-4">
      {customFilterOptions.map((filter) => (
        <FilterButton key={filter.label} filter={filter} setCustomFilter={setCustomFilter} customFilter={customFilter} />
      ))}
    </div>
  );
}

function Event({ e, index, model, refName, path }) {
  return (
    <tr key={index} className="border-t border-t-slate-100 hover:bg-slate-50 cursor-default">
      {refName && (
        <td className="px-4 py-3 cursor-pointer">
          <a href={`/${path}/${e.ref}`}>{e.ref}</a>
        </td>
      )}
      <td className="px-4 py-3">
        <p className="text-gray-400 truncate">
          {translateAction(e.op)} • {formatLongDateFR(e.date)}
        </p>
        <p>{translateModelFields(model, e.path)}</p>
      </td>
      <td className="px-4 py-3 truncate text-gray-400">{translateHistory(e.path, e.originalValue)}</td>
      <td className="px-4 py-3">
        <HiOutlineArrowRight />
      </td>
      <td className="px-4 py-3 truncate">{translateHistory(e.path, e.value)}</td>
      <td className="px-4 py-3">
        <UserCard user={e.user} />
      </td>
    </tr>
  );
}
