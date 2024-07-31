import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { formatStringLongDate, translate, translatePhase1, translatePhase2, translateApplication, translateEngagement, ROLES } from "snu-lib";
import { translateModelFields } from "../../utils";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { HiOutlineChevronUp, HiOutlineChevronDown, HiArrowRight } from "react-icons/hi";
import { useHistory } from "react-router-dom";

export default function Historic({ model, value }) {
  const [data, setData] = useState();
  const [filter, setFilter] = useState("");
  const user = useSelector((state) => state.Auth.user);

  const getPatches = async () => {
    try {
      const { ok, data } = await api.get(`/${model}/${value._id}/patches`);
      if (!ok) return;
      setData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPatches();
  }, []);

  return !data ? (
    <Loader />
  ) : (
    <div className="flex w-full flex-col gap-3">
      {data.length === 0 ? <div className="p-1 italic">Aucune données</div> : null}
      {user?.role === ROLES.ADMIN ? (
        <input onChange={(e) => setFilter(e.target.value)} value={filter} className="w-[350px] rounded-lg bg-white p-2" placeholder="Rechercher..." />
      ) : null}
      {data.map((hit) => (
        <Hit model={model} key={hit._id} hit={hit} filter={filter} />
      ))}
    </div>
  );
}

const Hit = ({ hit, model, filter }) => {
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
    (filter &&
      !hit.ops?.some((e) => {
        const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
        const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));

        const matchFieldName = translateModelFields(model, e.path.substring(1)).toLowerCase().includes(filter.toLowerCase().trim());
        const matchOriginalValue = (isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue)?.toLowerCase().includes(filter.toLowerCase().trim());
        const matchFromValue = (isIsoDate(value) ? formatStringLongDate(value) : value)?.toLowerCase().includes(filter.toLowerCase().trim());

        return matchFieldName || matchOriginalValue || matchFromValue;
      }))
  )
    return null;

  return (
    <div className="rounded-lg bg-white shadow-md">
      <div className="flex cursor-pointer items-center justify-between border-b p-3" onClick={() => setViewDetails((e) => !e)}>
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

        <div className="flex items-center gap-2 text-coolGray-500">
          <span className="italic">
            {hit.ops.length} action{hit.ops.length > 1 ? "s" : ""}
          </span>
          {viewDetails ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
        </div>
      </div>
      {viewDetails
        ? hit.ops
            ?.filter((e) => {
              if (filter) {
                const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
                const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));

                const matchFieldName = translateModelFields(model, e.path.substring(1)).toLowerCase().includes(filter.toLowerCase().trim());
                const matchOriginalValue = (isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue)?.toLowerCase().includes(filter.toLowerCase().trim());
                const matchFromValue = (isIsoDate(value) ? formatStringLongDate(value) : value)?.toLowerCase().includes(filter.toLowerCase().trim());

                return matchFieldName || matchOriginalValue || matchFromValue;
              } else return true;
            })
            ?.map((e, i) => {
              const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
              const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));
              if (["/jvaRawData"].some((blackfield) => e.path.includes(blackfield))) return null;
              return (
                <div className="flex justify-between border-b border-[#f3f3f3] p-3" key={`${hit.date}-${i}`}>
                  <div className="flex-1 ">{`${splitElementArray(translateModelFields(model, e.path.substring(1)))}`}&nbsp;:</div>
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
