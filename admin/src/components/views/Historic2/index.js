import React, { useState } from "react";
import { translateModelFields } from "../../../utils";
import { filterEvent, getOptions } from "./components/utils";
import { translateAction } from "snu-lib";

import FilterIcon from "../../../assets/icons/Filter";
import CustomFilters from "./components/CustomFilters";
import Event from "./components/Event";
import MultiSelect from "./components/Multiselect";

export default function Historic({ model, data, customFilterOptions, refName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [ops, setOps] = useState([]);
  const [paths, setPaths] = useState([]);
  const [customFilter, setCustomFilter] = useState(null);
  const [query, setQuery] = useState("");

  const filters = { paths, ops, authors, customFilter, query };
  const filteredData = data.filter((event) => filterEvent(filters, event, model));

  const pathOptions = getOptions(data, "path", (e) => translateModelFields(model, e));
  const opOptions = getOptions(data, "op", (e) => translateAction(e));
  const authorOptions = getOptions(data, "author");

  return (
    <div className="bg-white rounded-xl shadow-md text-gray-700">
      {!data.length && <div className="italic p-4">Aucune donnée</div>}
      <div className="p-4 space-y-6">
        <div className="flex gap-4">
          <input onChange={(e) => setQuery(e.target.value)} value={query} className="border p-2 rounded-lg w-64 text-xs" placeholder="Rechercher..." />
          <button onClick={() => setIsOpen(!isOpen)} className="group py-2 px-3 rounded-lg flex items-center gap-2 bg-gray-100 hover:bg-gray-400 transition">
            <FilterIcon className="fill-gray-400 group-hover:fill-gray-100 transition" />
            <p className="text-gray-400 group-hover:text-gray-100 transition">Filtres</p>
          </button>
          {customFilterOptions && <CustomFilters customFilterOptions={customFilterOptions} customFilter={customFilter} setCustomFilter={setCustomFilter} />}
        </div>
        {isOpen && (
          <div className="flex flex-wrap gap-4">
            <MultiSelect options={pathOptions} selected={paths} onChange={setPaths} label="Donnée modifiée" />
            <MultiSelect options={opOptions} selected={ops} onChange={setOps} label="Type d'action" />
            <MultiSelect options={authorOptions} selected={authors} onChange={setAuthors} label="Auteur de la modification" />
          </div>
        )}
      </div>

      <table className="table-fixed w-full">
        <thead>
          <tr className="uppercase border-t border-t-slate-100">
            {refName && <th className="font-normal px-4 py-3 text-xs text-gray-500">{refName}</th>}
            <th className="font-normal px-4 py-3 text-xs text-gray-500">Action</th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500">Détails</th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500 w-12"></th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500"></th>
            <th className="font-normal px-4 py-3 text-xs text-gray-500">Auteur</th>
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
