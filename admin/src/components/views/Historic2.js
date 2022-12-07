import React, { useState } from "react";
import { formatStringLongDate, translateModelFields, areObjectsEqual, isIsoDate, translateHistory } from "../../utils";
import { formatLongDateFR, translateAction } from "snu-lib";
import FilterIcon from "../../assets/icons/Filter";
import UserCard from "../UserCard";
import MultiSelect from "react-multi-select-component";
import { HiOutlineArrowRight } from "react-icons/hi";

export default function Historic({ model, data, filters }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [globalFilters, setGlobalFilters] = useState({ op: [], user: [], path: [] });
  const [customFilters, setCustomFilters] = useState([]);
  const activeFilters = [...customFilters, ...formatGlobalFilters(globalFilters)];
  const filteredData = filterData(data, activeFilters);

  const actionOptions = getOptions(data, "op");
  const userOptions = getOptions(data, "user");
  const fieldOptions = getOptions(data, "path");

  function formatGlobalFilters(filters) {
    let newFilters = [];
    for (const [key, value] of Object.entries(filters)) {
      if (value.length) {
        newFilters.push({ [key]: value.map((e) => e.value) });
      }
    }
    return newFilters;
  }

  function getOptions(data, key) {
    const arr = data.map((e) => e[key]);
    const unique = [...new Set(arr)];
    return unique.map((e) => e);
  }

  function updateGlobalFilters(n) {
    setGlobalFilters({ ...globalFilters, ...n });
  }

  function filterData(data, filters, query) {
    let filteredData = data;
    if (filters?.length) {
      filteredData = filteredData.filter((e) => filterEvent(e, filters));
    }
    if (query) {
      filteredData = filteredData.filter((e) => searchEvent(e, query));
    }
    return filteredData;
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

  function FilterButton({ filter, filterName }) {
    const checked = activeFilters.some((f) => areObjectsEqual(f, filter));

    function handleCustomFilter(newFilter) {
      let filters = [...activeFilters];
      if (filters.some((f) => areObjectsEqual(f, newFilter))) {
        filters = filters.filter((f) => !areObjectsEqual(f, newFilter));
      } else {
        filters.push(newFilter);
      }
      setCustomFilters(filters);
    }

    return (
      <label className={`text-blue-500 py-2 px-3 m-0 rounded-lg flex items-center gap-2 cursor-pointer ${checked && "underline underline-offset-8 decoration-2"}`}>
        <FilterIcon fill="dodgerblue" />
        {filterName}
        <input type="checkbox" checked={checked} onChange={() => handleCustomFilter(filter)} className="hidden" />
      </label>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      {!data.length && <div className="italic p-4">Aucune donnée</div>}
      <div className="flex p-4 gap-4">
        <input onChange={(e) => setSearch(e.target.value)} value={search} className="border p-2 rounded-lg w-64 text-xs" placeholder="Rechercher..." />
        <button onClick={() => setIsOpen(!isOpen)} className={`py-2 px-3 rounded-lg flex items-center gap-2 ${isOpen ? "bg-gray-600 text-white" : "bg-gray-100"}`}>
          <FilterIcon fill="gray" />
          <p>Filtres</p>
        </button>
        {filters.map((filter) => (
          <FilterButton key={filter.label} filter={filter.value} filterName={filter.label} />
        ))}
      </div>
      {isOpen && (
        <div className="flex flex-wrap gap-4 p-4">
          <MultiSelect
            options={actionOptions.map((e) => ({ label: translateAction(e), value: e }))}
            value={globalFilters.op}
            onChange={(op) => updateGlobalFilters({ op })}
            className="w-64"
          />
          <MultiSelect
            options={userOptions.map((e) => ({ label: e.firstName + " " + e.lastName, value: e._id }))}
            value={globalFilters.user}
            onChange={(user) => updateGlobalFilters({ user })}
            className="w-64 z-100"
          />
          <MultiSelect
            options={fieldOptions.map((e) => ({ label: translateModelFields(model, e), value: e }))}
            value={globalFilters.path}
            onChange={(path) => updateGlobalFilters({ path })}
            className="w-64 z-100"
          />
        </div>
      )}
      <table className="w-full z-0">
        <thead>
          <tr className="uppercase border-t border-t-slate-100">
            <th className="font-normal px-4 py-3 text-xs text-gray-500">Action</th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500">Détails</th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500"></th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500"></th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500">Auteur</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((e, index) => (
            <Event key={index} e={e} index={index} model={model} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Event({ e, index, model }) {
  return (
    <tr key={index} className="border-t border-t-slate-100 hover:bg-slate-50 cursor-default">
      <td className="px-4 py-3">
        <p className="text-gray-400">
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
