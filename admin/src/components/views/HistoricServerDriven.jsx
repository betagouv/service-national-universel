/**
 * Cette version de l'historique considère que les données, la pagination et les filtres se font côté serveur.
 */
import React, { useState, useCallback } from "react";
import { translateHistory, debounce } from "../../utils";
import { formatLongDateFR, translateAction, translateBusPatchesField } from "snu-lib";
import FilterIcon from "../../assets/icons/Filter";
import UserCard from "../UserCard";
import MultiSelect from "../legacy-dashboard/MultiSelect";
import { HiOutlineArrowRight } from "react-icons/hi";
import PaginationServerDriven from "../PaginationServerDriven";
import Loader from "../Loader";

export default function HistoricServerDriven({ data, refName, path, pagination, changePage, filters, changeFilters, filterOptions, loading = false, extraTool }) {
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
    <div className="w-full rounded-xl bg-white text-slate-700 shadow-md">
      <div className="flex w-full items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4 py-4">
          <input onChange={(e) => changeQuery(e.target.value)} value={query} className="w-64 rounded-lg border p-2 text-xs" placeholder="Rechercher..." />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`group flex items-center gap-2 rounded-lg py-2 px-3 ${isOpen ? "bg-gray-500 hover:bg-gray-100" : "bg-gray-100 hover:bg-gray-500"}`}>
            <FilterIcon className={isOpen ? "fill-gray-100 group-hover:fill-gray-500" : "fill-gray-500 group-hover:fill-gray-100"} />
            <p className={isOpen ? "text-gray-100 group-hover:text-gray-500" : "text-gray-500 group-hover:text-gray-100"}>Filtres</p>
          </button>
        </div>
        {!loading && (
          <div className="flex items-center gap-4">
            <PaginationServerDriven
              currentPageNumber={pagination.page}
              setCurrentPageNumber={changePage}
              itemsCountTotal={pagination.count}
              itemsCountOnCurrentPage={20}
              size={20}
            />
            {extraTool}
          </div>
        )}
      </div>
      {isOpen && FilterDrawer({ filters, changeFilters, filterOptions })}
      {loading ? (
        <div className="pb-12">
          <Loader />
        </div>
      ) : data.length === 0 ? (
        <div className="p-4 italic">Aucune donnée</div>
      ) : (
        <>
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-t border-t-slate-100 uppercase">
                {refName && <th className="px-4 py-3 text-xs font-normal text-gray-500">{refName}</th>}
                <th className="px-4 py-3 text-xs font-normal text-gray-500">Action</th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500">Détails</th>
                <th className="w-16 px-4 py-3 text-xs font-normal text-gray-500"></th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500"></th>
                <th className="px-4 py-3 text-xs font-normal text-gray-500">Auteur</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e, index) => (
                <Event key={index} e={e} index={index} refName={refName} path={path} />
              ))}
            </tbody>
          </table>
          <hr className="border-t border-t-slate-100" />
          <PaginationServerDriven currentPageNumber={pagination.page} setCurrentPageNumber={changePage} itemsCountTotal={pagination.count} itemsCountOnCurrentPage={20} size={20} />
          <hr className="mt-3" />
        </>
      )}
    </div>
  );
}

function Event({ e, index, refName, path }) {
  return (
    <tr key={index} className="cursor-default border-t border-t-slate-100 hover:bg-slate-50">
      {refName && (
        <td className="cursor-pointer overflow-hidden px-4 py-3">
          <a href={`/${path}/${e.ref}`}>{e.refName}</a>
        </td>
      )}
      <td className="overflow-hidden px-4 py-3">
        <p className="truncate text-gray-400">
          {translateAction(e.op)} • {formatLongDateFR(e.date)}
        </p>
        <p>{translateBusPatchesField(e.path)}</p>
      </td>
      <td className="truncate px-4 py-3 text-gray-400">{translateHistory(e.path, e.originalValue)}</td>
      <td className="px-4 py-3">
        <HiOutlineArrowRight />
      </td>
      <td className="truncate px-4 py-3">{translateHistory(e.path, e.value)}</td>
      <td className="overflow-hidden px-4 py-3">
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
    <div className="flex flex-wrap gap-4 bg-slate-50 p-4">
      <MultiSelect
        options={filterOptions ? filterOptions.path.map((e) => ({ label: translateBusPatchesField(e), value: e })) : []}
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
