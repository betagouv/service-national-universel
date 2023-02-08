import React, { useState } from "react";
import { translateModelFields } from "../../../utils";
import { filterEvent, getOptions } from "./components/utils";
import { translateAction } from "snu-lib";

import FilterIcon from "../../../assets/icons/Filter";
import Email from "./components/Email";
import MultiSelect from "./components/Multiselect";

export default function Emails({ data }) {
  console.log("🚀 ~ file: index.js:11 ~ Historic ~ data", data);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [obj, setObj] = useState([]);
  // const [date, setDate] = useState([]);
  const [templateID, setTemplateID] = useState("");

  const filters = { obj, templateID, query };
  // const filteredData = data.filter((event) => filterEvent(filters, event));

  const objOptions = getOptions(data, "subject");
  // const opOptions = getOptions(data, "op", (e) => translateAction(e));
  const templateIDOptions = getOptions(data, "templateId");

  return (
    <div className="bg-white rounded-xl shadow-md text-gray-700">
      {!data?.length && <div className="italic p-4">Aucune donnée</div>}
      <div className="p-4 space-y-6">
        <div className="flex gap-4">
          <input onChange={(e) => setQuery(e.target.value)} value={query} className="border p-2 rounded-lg w-64 text-xs" placeholder="Rechercher..." />
          <button onClick={() => setIsOpen(!isOpen)} className="group py-2 px-3 rounded-lg flex items-center gap-2 bg-gray-100 hover:bg-gray-400 transition">
            <FilterIcon className="fill-gray-400 group-hover:fill-gray-100 transition" />
            <p className="text-gray-400 group-hover:text-gray-100 transition">Filtres</p>
          </button>
        </div>
        {isOpen && (
          <div className="flex flex-wrap gap-4">
            {/* <MultiSelect options={objOptions} selected={obj} onChange={setObj} label="Donnée modifiée" /> */}
            {/* <MultiSelect options={} selected={date} onChange={seDtate} label="Type d'action" /> */}
            {/* <MultiSelect options={templateIDOptions} selected={templateID} onChange={setTemplateID} label="Auteur de la modification" /> */}
          </div>
        )}
      </div>

      <table className="table-auto w-full">
        <thead>
          <tr className="uppercase border-t border-t-slate-100">
            <th className="w-1/2 font-normal px-4 py-3 text-xs text-gray-500">Objet de l&apos;email</th>
            <th className="w-1/4 font-normal px-4 py-3 text-xs text-gray-500">Date d&apos;envoi</th>
            <th className="w-1/4 font-normal px-4 py-3 text-xs text-gray-500">Template ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((email, index) => (
            <Email key={index} email={email} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
