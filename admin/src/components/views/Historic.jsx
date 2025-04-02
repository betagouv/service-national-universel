import React, { useState } from "react";
import { useSelector } from "react-redux";
import { formatStringLongDate, translate, ROLES } from "../../utils";
import Loader from "../../components/Loader";
import { HiOutlineChevronDown, HiArrowRight } from "react-icons/hi";
import { useToggle } from "@uidotdev/usehooks";
import { filterResult, getFieldName, translator } from "./lib/patchesUtils";
import { isIsoDate } from "snu-lib";
import { usePatches } from "./lib/usePatches";
import ReactTooltip from "react-tooltip";

export default function Historic({ model, value }) {
  const { data: patches, isPending } = usePatches(model, value);
  const [simpleMode, setSimpleMode] = useToggle(true);
  const [search, setSearch] = useState("");
  const filteredPatches = patches?.filter((hit) => filterResult(model, hit, search, simpleMode)) || [];
  const user = useSelector((state) => state.Auth.user);

  return isPending ? (
    <Loader />
  ) : (
    <>
      {user?.role === ROLES.ADMIN ? (
        <>
          <input onChange={(e) => setSearch(e.target.value)} value={search} className="w-full rounded-lg bg-white p-3 shadow-md" placeholder="Rechercher..." />
          {model === "mission" ? (
            <div className="w-fit">
              <ReactTooltip id="filter-modifs" className="bg-white shadow-xl" arrowColor="white">
                <ul className="text-gray-800">
                  <li>Masquer les synchronisations n'ayant pas entraîné de modification</li>
                  <li>Masquer les données source</li>
                  <li>Traduire les noms des champs</li>
                </ul>
              </ReactTooltip>
              <div data-tip data-for="filter-modifs" className="p-3">
                <input id="filter-modifs" type="checkbox" checked={simpleMode} onChange={setSimpleMode} />
                <label htmlFor="filter-modifs" className="m-0 ml-2 text-coolGray-500">
                  Mode simplifié
                </label>
              </div>
            </div>
          ) : (
            <div className="p-3"></div>
          )}
        </>
      ) : null}
      {filteredPatches ? <List model={model} patches={filteredPatches} simpleMode={simpleMode} /> : <p>Aucune donnée.</p>}
    </>
  );
}

function List({ model, patches, simpleMode }) {
  return (
    <div className="grid gap-3">
      {patches.map((hit) => (
        <Hit model={model} key={hit._id} hit={hit} simpleMode={simpleMode} />
      ))}
    </div>
  );
}

const Hit = ({ hit, model, simpleMode }) => {
  const [viewModifs, setViewModifs] = useToggle(true);
  const user = useSelector((state) => state.Auth.user);
  const modifications = simpleMode ? hit.ops.filter((op) => !op.path.includes("/jvaRawData") && !op.path.includes("/lastSyncAt")) : hit.ops;

  return (
    <div className="rounded-lg bg-white shadow-md">
      <div className="border-b p-3 flex justify-between">
        <p>
          <strong>
            {hit.user && hit.user.email ? (
              hit.user.role ? (
                // * Referent
                <a href={`/user/${hit.user._id}`} target="_blank" rel="noreferrer" className="text-blue-600 underline-offset-2 hover:text-blue-600 hover:underline">
                  {`${hit.user.firstName} ${hit.user.lastName} (${translate(hit.user.role)})`}
                </a>
              ) : (
                // * Young
                <a href={`/volontaire/${hit.user._id}`} target="_blank" rel="noreferrer" className="text-blue-600 underline-offset-2 hover:text-blue-600 hover:underline">
                  {`${hit.user.firstName} ${hit.user.lastName} (Volontaire)`}
                </a>
              )
            ) : hit.user && hit.user.firstName ? (
              // * Scripts / Cron
              user?.role === ROLES.ADMIN ? (
                hit.user.firstName
              ) : (
                "Modification automatique"
              )
            ) : (
              "Acteur non renseigné"
            )}
          </strong>
          ,&nbsp;{formatStringLongDate(hit.date)}
        </p>
        <button className="text-gray-500" onClick={setViewModifs}>
          {modifications.length} modification{hit.ops.length > 1 ? "s" : ""}
          <HiOutlineChevronDown className={`inline-block ml-2 transition-all duration-300 ease-in-out ${viewModifs && "rotate-180"}`} />
        </button>
      </div>

      {viewModifs
        ? modifications.map((e, i) => {
            const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
            const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));
            return (
              <div className="grid grid-cols-12 border-b border-gray-100 p-3" key={`${hit.date}-${i}`}>
                <div className="col-span-3">{simpleMode ? getFieldName(model, e.path) : e.path}&nbsp;:</div>
                <div className="col-span-4">
                  {(isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue) || <span className="italic text-coolGray-400">Vide</span>}
                </div>
                <div>
                  <HiArrowRight className="mx-auto my-1" />
                </div>
                <div className="col-span-4">{(isIsoDate(value) ? formatStringLongDate(value) : value) || <span className="italic text-coolGray-400">Vide</span>}</div>
              </div>
            );
          })
        : null}
    </div>
  );
};
