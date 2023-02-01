/**
 * Cette version de l'historique considère que les données, la pagination et les filtres se font côté serveur.
 */
import React, { useState, useCallback } from "react";
import { translateHistory, debounce } from "../../utils";
import { formatLongDateFR, translateAction, translateBusPatchesField } from "snu-lib";
import FilterIcon from "../../assets/icons/Filter";
import UserCard from "../UserCard";
import MultiSelect from "../../scenes/dashboard/components/MultiSelect";
import { HiOutlineArrowRight } from "react-icons/hi";
import Pagination3 from "../Pagination3";

export default function Historic3({ data, refName, path, pagination, changePage, filters, changeFilters, filterOptions }) {
  const [query, setQuery] = useState(filters?.query ? filters.query : "");
  const [isOpen, setIsOpen] = useState(
    filters && ((filters.op && filters.op.length > 0) || (filters.path && filters.path.length > 0) || (filters.author && filters.author.length > 0)),
  );

  const debouncedChangeFilter = useCallback(
    debounce(async (value) => {
      changeFilters({ ...filters, ...value });
    }, 500),
    [],
  );

  function changeQuery(value) {
    setQuery(value);
    debouncedChangeFilter({ query: value });
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-md text-slate-700">
      {!data.length && <div className="italic p-4">Aucune donnée</div>}
      <div className="w-full flex p-4 gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
          <input onChange={(e) => changeQuery(e.target.value)} value={query} className="border p-2 rounded-lg w-64 text-xs" placeholder="Rechercher..." />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`group py-2 px-3 rounded-lg flex items-center gap-2 ${isOpen ? "bg-gray-500 hover:bg-gray-100" : "bg-gray-100 hover:bg-gray-500"}`}>
            <FilterIcon className={isOpen ? "fill-gray-100 group-hover:fill-gray-500" : "fill-gray-500 group-hover:fill-gray-100"} />
            <p className={isOpen ? "text-gray-100 group-hover:text-gray-500" : "text-gray-500 group-hover:text-gray-100"}>Filtres</p>
          </button>
        </div>
        <Pagination3
          pageCount={pagination.pageCount}
          currentPage={pagination.page}
          changePage={changePage}
          count={pagination.count}
          itemsPerPage={pagination.itemsPerPage}
          itemsCount={data.length}
          className="p-4"
        />
      </div>
      {isOpen && FilterDrawer({ filters, changeFilters, filterOptions })}
      <table className="table-fixed w-full">
        <thead>
          <tr className="uppercase border-t border-t-slate-100">
            {refName && <th className="font-normal px-4 py-3 text-xs text-gray-500">{refName}</th>}
            <th className="font-normal px-4 py-3 text-xs text-gray-500">Action</th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500">Détails</th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500 w-16"></th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500"></th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500">Auteur</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e, index) => (
            <Event key={index} e={e} index={index} refName={refName} path={path} />
          ))}
        </tbody>
      </table>
      <hr className="border-t border-t-slate-100" />
      <Pagination3
        pageCount={pagination.pageCount}
        currentPage={pagination.page}
        changePage={changePage}
        count={pagination.count}
        itemsPerPage={pagination.itemsPerPage}
        itemsCount={data.length}
        className="p-4"
      />
    </div>
  );
}

function Event({ e, index, refName, path }) {
  return (
    <tr key={index} className="border-t border-t-slate-100 hover:bg-slate-50 cursor-default">
      {refName && (
        <td className="px-4 py-3 cursor-pointer overflow-hidden">
          <a href={`/${path}/${e.ref}`}>{e.refName}</a>
        </td>
      )}
      <td className="px-4 py-3 overflow-hidden">
        <p className="text-gray-400 truncate">
          {translateAction(e.op)} • {formatLongDateFR(e.date)}
        </p>
        <p>{translateBusPatchesField(e.path)}</p>
      </td>
      <td className="px-4 py-3 truncate text-gray-400">{translateHistory(e.path, e.originalValue)}</td>
      <td className="px-4 py-3">
        <HiOutlineArrowRight />
      </td>
      <td className="px-4 py-3 truncate">{translateHistory(e.path, e.value)}</td>
      <td className="px-4 py-3 overflow-hidden">
        <UserCard user={e.user} />
      </td>
    </tr>
  );
}

function FilterDrawer({ filters, changeFilters, filterOptions }) {
  function getAuthorOptions() {
    return filterOptions ? filterOptions.user.map((e) => ({ label: e.firstName + " " + e.lastName, value: e._id })) : [];
  }

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-slate-50">
      <MultiSelect
        options={filterOptions ? filterOptions.path.map((e) => ({ label: translateBusPatchesField(e) + " - " + e, value: e })) : []}
        value={filters.path}
        onChange={(path) => changeFilters((f) => ({ ...f, ...{ path } }))}
        label="Donnée modifiée"
      />
      <MultiSelect
        options={filterOptions ? filterOptions.op.map((e) => ({ label: translateAction(e), value: e })) : []}
        value={filters.op}
        onChange={(op) => changeFilters((f) => ({ ...f, ...{ op } }))}
        label="Type d'action"
      />
      <MultiSelect options={getAuthorOptions()} value={filters.author} onChange={(author) => changeFilters((f) => ({ ...f, ...{ author } }))} label="Auteur de la modification" />
    </div>
  );
}
