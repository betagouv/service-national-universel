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
    <div className="max-w-[1600px] rounded-xl bg-white text-gray-700 shadow-md">
      {!data.length && <div className="p-4 italic">Aucune donnée</div>}
      <div className="space-y-6 p-4">
        <div className="flex gap-4">
          <input onChange={(e) => setQuery(e.target.value)} value={query} className="w-64 rounded-lg border p-2 text-xs" placeholder="Rechercher..." />
          <button onClick={() => setIsOpen(!isOpen)} className="group flex items-center gap-2 rounded-lg bg-gray-100 py-2 px-3 transition hover:bg-gray-400">
            <FilterIcon className="fill-gray-400 transition group-hover:fill-gray-100" />
            <p className="text-gray-400 transition group-hover:text-gray-100">Filtres</p>
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
      <div className="mt-6 mb-2 flex w-full flex-col divide-y divide-gray-100 border-y-[1px] border-gray-100">
        <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400">
          <div className="w-[25%]">Action</div>
          <div className="w-[20%]">Détails</div>
          <div className="w-[10%]"></div>
          <div className="w-[20%]"></div>
          <div className="w-[25%]">Auteur</div>
        </div>
        {filteredData.map((e, index) => (
          <Event key={index} e={e} index={index} model={model} refName={refName} />
        ))}
      </div>
    </div>
  );
}
