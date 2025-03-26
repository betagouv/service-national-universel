import React, { useState } from "react";
import { useSelector } from "react-redux";
import { formatStringLongDate, translate, ROLES } from "../../utils";
import Loader from "../../components/Loader";
import { HiOutlineChevronUp, HiOutlineChevronDown, HiArrowRight } from "react-icons/hi";
import { useToggle } from "@uidotdev/usehooks";
import { filterResult, getFieldName, translator } from "./lib/patchesUtils";
import { isIsoDate } from "snu-lib";
import { usePatches } from "./lib/usePatches";

export default function Historic({ model, value }) {
  const { data: patches, isPending } = usePatches(model, value);
  const [hideSync, setHideSync] = useToggle(true);
  const [filter, setFilter] = useState("");
  const filteredPatches = patches?.filter((hit) => filterResult(model, hit, filter, hideSync));
  const user = useSelector((state) => state.Auth.user);

  return isPending ? (
    <Loader />
  ) : (
    <div className="flex w-full flex-col gap-3">
      {filteredPatches.length === 0 ? <div className="p-1 italic">Aucune donnée</div> : null}
      {user?.role === ROLES.ADMIN ? (
        <div className="grid grid-cols-2 gap-4">
          <input onChange={(e) => setFilter(e.target.value)} value={filter} className="rounded-lg bg-white p-2 shadow-sm" placeholder="Rechercher..." />
          {model === "mission" && (
            <div className="mt-2">
              <input id="filter-modifs" type="checkbox" checked={hideSync} onChange={setHideSync} />
              <label htmlFor="filter-modifs" className="ml-2 text-coolGray-500">
                Masquer les synchronisations sans modification et les données source.
              </label>
            </div>
          )}
        </div>
      ) : null}
      {filteredPatches.map((hit) => (
        <Hit model={model} key={hit._id} hit={hit} hideSync={hideSync} />
      ))}
    </div>
  );
}

const Hit = ({ hit, model, hideSync }) => {
  const [viewDetails, setViewDetails] = useState(true);
  const user = useSelector((state) => state.Auth.user);
  const filteredOps = hideSync ? hit.ops.filter((op) => !op.path.includes("/jvaRawData") && !op.path.includes("/lastSyncAt")) : hit.ops;

  return (
    <div className="rounded-lg bg-white shadow-md">
      <button className="w-full flex items-center justify-between border-b p-3" onClick={() => setViewDetails((e) => !e)}>
        <div>
          <span className="font-bold">
            {hit.user && hit.user.email ? (
              hit.user.role ? (
                // * Referent
                <a href={`/user/${hit.user._id}`} target="_blank" rel="noreferrer" className="text-snu-purple-300 hover:text-snu-purple-300 hover:underline">
                  {`${hit.user.firstName} ${hit.user.lastName} (${translate(hit.user.role)})`}
                </a>
              ) : (
                // * Young
                <a href={`/volontaire/${hit.user._id}`} target="_blank" rel="noreferrer" className="text-snu-purple-300 hover:text-snu-purple-300 hover:underline">
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

        <div className="flex items-center gap-2 text-coolGray-500">
          <span className="italic">
            {hit.ops.length} action{hit.ops.length > 1 ? "s" : ""}
          </span>
          {viewDetails ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
        </div>
      </button>

      {viewDetails
        ? filteredOps?.map((e, i) => {
            const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
            const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));
            return (
              <div className="flex justify-between border-b border-[#f3f3f3] p-3" key={`${hit.date}-${i}`}>
                <div className="flex-1 ">{getFieldName(model, e.path)}&nbsp;:</div>
                <div className="flex-1 text-center">
                  {(isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue) || <span className="italic text-coolGray-400">Vide</span>}
                </div>
                <div className="text-center">
                  <HiArrowRight />
                </div>
                <div className="flex-1 text-center">{(isIsoDate(value) ? formatStringLongDate(value) : value) || <span className="italic text-coolGray-400">Vide</span>}</div>
              </div>
            );
          })
        : null}
    </div>
  );
};
