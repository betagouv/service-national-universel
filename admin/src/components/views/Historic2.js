import React, { useState } from "react";
import { useSelector } from "react-redux";

import {
  formatStringLongDate,
  translateModelFields,
  translate,
  translatePhase1,
  translatePhase2,
  translateApplication,
  translateEngagement,
  ROLES,
  areObjectsEqual,
  isIsoDate,
} from "../../utils";
import { HiOutlineChevronUp, HiOutlineChevronDown, HiArrowRight, HiOutlineArrowRight } from "react-icons/hi";
import { useHistory } from "react-router-dom";
import { formatLongDateFR, translateAction } from "snu-lib";
import Filter from "../../assets/icons/Filter";
import UserCard from "../UserCard";

export default function Historic({ model, data, filters }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  console.log("🚀 ~ file: Historic2.js:25 ~ activeFilters", activeFilters);
  const filteredData = filterData(data, activeFilters);
  console.log("🚀 ~ file: Historic2.js:32 ~ Historic ~ filteredData", filteredData);

  // function generateFilters(data) {
  //   let filters = {};
  //   for (const op of data) {
  //     if (!filters[op.path]) filters[op.path] = [];
  //     filters[op.path].push(op.value);
  //   }
  //   return filters;
  // }

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
    function handleChangeFilter(newFilter) {
      let filters = [...activeFilters];
      if (filters.some((filter) => areObjectsEqual(filter, newFilter))) {
        filters = filters.filter((filter) => !areObjectsEqual(filter, newFilter));
      } else {
        filters.push(newFilter);
      }
      setActiveFilters(filters);
    }
    return (
      <label className={`text-blue-500 py-2 px-3 m-0 rounded-lg flex items-center gap-2 cursor-pointer ${checked && "underline underline-offset-8 decoration-2"}`}>
        <Filter fill="dodgerblue" />
        {filterName}
        <input type="checkbox" checked={checked} onChange={() => handleChangeFilter(filter)} className="hidden" />
      </label>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      {!data.length && <div className="italic p-4">Aucune donnée</div>}
      <div className="flex p-4 gap-4">
        <input onChange={(e) => setSearch(e.target.value)} value={search} className="border p-2 rounded-lg w-64 text-xs" placeholder="Rechercher..." />
        <button onClick={() => setIsOpen(!isOpen)} className={`bg-gray-100 py-2 px-3 rounded-lg flex items-center gap-2 ${isOpen && "border"}`}>
          <Filter fill="gray" />
          <p>Filtres</p>
        </button>

        {filters.map((filter) => (
          <FilterButton key={filter.label} filter={filter.value} filterName={filter.label} />
        ))}
        {/* {isOpen &&
          Object.entries(filters)?.map(([key, value]) => (
            <label key={key} className="p-2 m-0 text-blue-600">
              {key}
              <input type={"checkbox"} checked={activeFilters.includes([key, value])} onChange={() => handleChange(value)} />
            </label>
          ))} */}
        {/* {Object.entries(filters).map(([key, value]) => (
          <label key={key} htmlFor={key} className="p-2 m-0 text-blue-600">
          {translate(key.substring(1))}
          <select name={key} id={key}>
          {new Set(value)?.map((e) => (
            <option key={e} value={e}>
            {translate(e)}
            </option>
            ))}
            </select>
            </label>
          ))} */}
      </div>
      {isOpen && (
        <div className="p-4 gap-4">
          <label>
            <p>Changements de session</p>
            <select name="status" id="status" className="border p-2 rounded-lg w-64 text-xs">
              {["2019", "2020", "2021"].map((option) => (
                <option key={option} value={option}>
                  {/* {translateModelFields(model, option)} */}
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <table className="w-full">
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
  const translator = (path, value) => {
    if (path === "/statusPhase1") {
      return translatePhase1(value);
    } else if (path === "/statusPhase2") {
      return translatePhase2(value);
    } else if (path === "/phase2ApplicationStatus") {
      return translateApplication(value);
    } else if (path === "/statusPhase2Contract") {
      return translateEngagement(value);
    } else if (path.includes("files")) {
      return value?.name;
    } else if (isIsoDate(value)) {
      return formatStringLongDate(value);
    } else {
      return translate(value);
    }
  };

  return (
    <tr key={index} className="border-t border-t-slate-100">
      <td className="px-4 py-3">
        <p className="text-gray-400">
          {translateAction(e.op)} • {formatLongDateFR(e.date)}
        </p>
        <p>{translateModelFields(model, e.path)}</p>
      </td>
      <td className="px-4 py-3 text-gray-400">{translator(e.path, e.originalValue)}</td>
      <td className="px-4 py-3">
        <HiOutlineArrowRight />
      </td>
      <td className="px-4 py-3">{translator(e.path, e.value)}</td>
      <td className="px-4 py-3">
        <UserCard user={e.user} />
      </td>
    </tr>
  );
}

const Hit = ({ hit, model, search }) => {
  const [viewDetails, setViewDetails] = useState(true);
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  function isIsoDate(str) {
    if (!Date.parse(str)) return false;
    var d = new Date(str);
    return d.toISOString() === str;
  }

  const splitElementArray = (v) => {
    // si on modifie la valeur d'un element d'un champs array
    // on doit le parser car il est affiché sous la forme : field/index
    const elementOfArry = v.match(/(\w*)\/(\d)/);
    if (elementOfArry?.length) {
      //console.log("✍️ ~ elementOfArry", elementOfArry);
      return `${translateModelFields(model, elementOfArry[1])} (nº${Number(elementOfArry[2]) + 1})`;
    }
    return v;
  };

  const translator = (path, value) => {
    if (path === "/statusPhase1") {
      return translatePhase1(value);
    } else if (path === "/statusPhase2") {
      return translatePhase2(value);
    } else if (path === "/phase2ApplicationStatus") {
      return translateApplication(value);
    } else if (path === "/statusPhase2Contract") {
      return translateEngagement(value);
    } else {
      return translate(value);
    }
  };

  if (
    !hit ||
    (search &&
      !hit.ops?.some((e) => {
        const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
        const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));

        const matchFieldName = translateModelFields(model, e.path.substring(1)).toLowerCase().includes(search.toLowerCase().trim());
        const matchOriginalValue = (isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue)?.toLowerCase().includes(search.toLowerCase().trim());
        const matchFromValue = (isIsoDate(value) ? formatStringLongDate(value) : value)?.toLowerCase().includes(search.toLowerCase().trim());

        return matchFieldName || matchOriginalValue || matchFromValue;
      }))
  )
    return null;

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="flex p-3 border-b justify-between items-center cursor-pointer" onClick={() => setViewDetails((e) => !e)}>
        <div>
          <span className="font-bold">
            {hit.user && hit.user.email ? (
              hit.user.role ? (
                // * Referent
                <a onClick={() => history.push(`/user/${hit.user._id}`)} className="cursor-pointer text-snu-purple-300 hover:text-snu-purple-300 hover:underline">
                  {`${hit.user.firstName} ${hit.user.lastName} (${translate(hit.user.role)})`}
                </a>
              ) : (
                // * Young
                <a onClick={() => history.push(`/volontaire/${hit.user._id}`)} className="cursor-pointer text-snu-purple-300 hover:text-snu-purple-300 hover:underline">
                  {`${hit.user.firstName} ${hit.user.lastName} (Volontaire)`}
                </a>
              )
            ) : hit.user && hit.user.firstName ? (
              // * Scripts / Cron
              user?.role === ROLES.ADMIN ? (
                [hit.user.firstName, hit.user.lastName].join(" ")
              ) : (
                "Modification automatique"
              )
            ) : (
              "Acteur non renseigné"
            )}
          </span>
          ,&nbsp;{formatStringLongDate(hit.date)}
        </div>

        <div className="flex gap-2 items-center text-coolGray-500">
          <span className="italic">
            {hit.ops.length} action{hit.ops.length > 1 ? "s" : ""}
          </span>
          {viewDetails ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
        </div>
      </div>
      {viewDetails
        ? hit.ops
            ?.filter((e) => {
              if (search) {
                const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
                const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));

                const matchFieldName = translateModelFields(model, e.path.substring(1)).toLowerCase().includes(search.toLowerCase().trim());
                const matchOriginalValue = (isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue)?.toLowerCase().includes(search.toLowerCase().trim());
                const matchFromValue = (isIsoDate(value) ? formatStringLongDate(value) : value)?.toLowerCase().includes(search.toLowerCase().trim());

                return matchFieldName || matchOriginalValue || matchFromValue;
              } else return true;
            })
            ?.map((e, i) => {
              const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
              const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));
              if (["/jvaRawData"].some((blackfield) => e.path.includes(blackfield))) return null;
              return (
                <div className="flex p-3 justify-between border-b border-[#f3f3f3]" key={`${hit.date}-${i}`}>
                  <div className="flex-1 ">{`${splitElementArray(translateModelFields(model, e.path.substring(1)))}`}&nbsp;:</div>
                  <div className="flex-1 text-center">
                    {(isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue) || <span className="text-coolGray-400 italic">Vide</span>}
                  </div>
                  <div className="text-center">
                    <HiArrowRight />
                  </div>
                  <div className="flex-1 text-center">{(isIsoDate(value) ? formatStringLongDate(value) : value) || <span className="text-coolGray-400 italic">Vide</span>}</div>
                </div>
              );
            })
        : null}
    </div>
  );
};
