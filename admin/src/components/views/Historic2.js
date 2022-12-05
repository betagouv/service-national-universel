import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { formatStringLongDate, translateModelFields, translate, translatePhase1, translatePhase2, translateApplication, translateEngagement, ROLES } from "../../utils";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { HiOutlineChevronUp, HiOutlineChevronDown, HiArrowRight } from "react-icons/hi";
import { useHistory } from "react-router-dom";
import { formatDateFR, formatStringDate, translateAction, translateField } from "snu-lib";

export default function Historic({
  model,
  value,
  // filters = [
  //   { value: "/status", label: "Statut général" },
  //   { value: "/cohort", label: "Cohorte" },
  // ],
}) {
  const [data, setData] = useState([]);
  const filters = generateFilters(data);
  console.log("🚀 ~ file: Historic2.js:21 ~ filters", Object.entries(filters));
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const filteredData = filterData(data, activeFilters);
  console.log("🚀 ~ file: Historic2.js:23 ~ filteredData", filteredData);

  // function filterData(data, filters) {
  //   if (filters.length) return data.filter(({ path }) => filters.includes(path));
  //   return data;
  // }

  // const filters = {
  //   statusPhase1: ["WAITING_VALIDATION", "VALIDATED", "REFUSED"],
  //   statusPhase2: ["WAITING_VALIDATION", "VALIDATED", "REFUSED"],
  // };

  function generateFilters(data) {
    let filters = {};
    for (const op of data) {
      if (!filters[op.path]) filters[op.path] = [];
      filters[op.path].push(op.value);
    }
    return filters;
  }

  function filterData(data, filters) {
    if (filters.length) {
      return data.filter((e) => Object.entries(filters).some(([key, value]) => (e.path === key && value.length ? value.includes(e.originalValue || e.value) : true)));
    }
    return data;
  }

  const getPatches = async () => {
    try {
      const { ok, data } = await api.get(`/${model}/${value._id}/patches`);
      if (!ok) return;
      setData(formatHistory(data));
    } catch (error) {
      console.log(error);
    }
  };

  function handleChange(value) {
    let newArr = [...activeFilters];
    if (newArr.includes(value)) newArr = newArr.filter((item) => item !== value);
    else newArr.push(value);
    setActiveFilters(newArr);
  }

  useEffect(() => {
    getPatches();
  }, []);

  function formatHistory(data) {
    function formatField(field) {
      return JSON.stringify(field)?.replace(/"/g, "");
    }
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
    const history = [];
    for (const hit of data) {
      for (const e of hit.ops) {
        e.date = formatDateFR(hit.date);
        e.user = hit.user;
        e.path = formatField(e.path);
        e.value = e.path.includes("files") ? e.value.name : translator(e.path, formatField(e.value));
        e.originalValue = translator(e.path, formatField(e.originalValue));
        history.push(e);
      }
    }
    return history;
  }

  function isIsoDate(str) {
    if (!Date.parse(str)) return false;
    var d = new Date(str);
    return d.toISOString() === str;
  }

  function filterResults(query, e) {
    if (query) {
      const serializedQuery = query.toLowerCase().trim();
      const matchFieldName = translateModelFields(model, e.path).toLowerCase().includes(serializedQuery);
      const matchOriginalValue = (isIsoDate(e.originalValue) ? formatStringLongDate(e.originalValue) : e.originalValue)?.toLowerCase().includes(serializedQuery);
      const matchFromValue = (isIsoDate(e.value) ? formatStringLongDate(e.value) : e.value)?.toLowerCase().includes(serializedQuery);

      return matchFieldName || matchOriginalValue || matchFromValue;
    } else return true;
  }

  const statusPhase1Options = ["AFFECTED", "WAITING_AFFECTATION", "WAITING_ACCEPTATION", "CANCEL", "EXEMPTED", "DONE", "NOT_DONE", "WITHDRAWN", "WAITING_LIST"];

  if (!data.length) return <Loader />;
  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      {!data.length && <div className="italic p-4">Aucune donnée</div>}
      <div className="flex p-4 gap-4">
        <input onChange={(e) => setSearch(e.target.value)} value={search} className="border p-2 rounded-lg w-64 text-xs" placeholder="Rechercher..." />
        <button onClick={() => setIsOpen(!isOpen)} className="bg-gray-100 py-2 px-3 rounded-lg">
          Filtres
        </button>
        {isOpen &&
          Object.entries(filters)?.map(([key, value]) => (
            <label key={key} className="p-2 m-0 text-blue-600">
              {key}
              <input type={"checkbox"} checked={activeFilters.includes([key, value])} onChange={() => handleChange(value)} />
            </label>
          ))}
        {/* <label htmlFor="statusPhase1" className="p-2 m-0 text-blue-600">
          Statut de phase 1
        </label> */}
        {Object.entries(filters).map(([key, value]) => (
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
        ))}
        <select name="statusPhase1" id="statusPhase1" className="border p-2 rounded-lg w-64 text-xs" multiple>
          {statusPhase1Options.map((option) => (
            <option key={option} value={option}>
              {translate(option)}
            </option>
          ))}
        </select>
      </div>
      <table className="w-full">
        <thead>
          <tr className="uppercase border-t border-t-slate-100">
            <th className="font-normal p-4 text-xs text-gray-500">Action</th>
            <th className="font-normal p-4 text-xs text-gray-500">Détails</th>
            <th className="font-normal p-4 text-xs text-gray-500"></th>
            <th className="font-normal p-4 text-xs text-gray-500"></th>
            <th className="font-normal p-4 text-xs text-gray-500">Auteur</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((e, index) => (
            <tr key={index} className="border-t border-t-slate-100">
              <td className="p-4">
                <p className="text-gray-400">
                  {translateAction(e.op)} - {e.date}
                </p>
                <p>{translateField(e.path.substring(1))}</p>
              </td>
              <td className="p-4 text-gray-400">{e.originalValue}</td>
              <td className="p-4">-&gt;</td>
              <td className="p-4">{e.value}</td>
              <td className="p-4">
                <p>
                  {e.user?.firstName} {e.user?.lastName}
                </p>
                <p className="text-gray-400">{e.user?.role}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
