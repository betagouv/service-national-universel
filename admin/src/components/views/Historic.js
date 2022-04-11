import React, { useState, useEffect } from "react";

import { formatStringLongDate, translateModelFields, translate, translatePhase1, translatePhase2, translateApplication, translateEngagement } from "../../utils";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { HiOutlineChevronUp, HiOutlineChevronDown, HiArrowRight } from "react-icons/hi";

export default function Historic({ model, value }) {
  const [data, setData] = useState();

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
    <div>
      <div className="flex flex-col gap-3 w-full">
        {data.length === 0 ? <div className="italic p-1">Aucune données</div> : null}
        {data.map((hit) => (
          <Hit model={model} key={hit._id} hit={hit} />
        ))}
      </div>
    </div>
  );
}

const Hit = ({ hit, model }) => {
  const [viewDetails, setViewDetails] = useState(true);
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

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="flex p-3 border-b justify-between items-center cursor-pointer" onClick={() => setViewDetails((e) => !e)}>
        <div>
          <span className="font-bold">{hit.user && hit.user.firstName && hit.user.lastName ? `${hit.user.firstName} ${hit.user.lastName}` : "Acteur non renseigné"}</span>
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
        ? hit.ops?.map((e, i) => {
            const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
            const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));
            if (["/jvaRawData"].includes(e.path)) return null;
            return (
              <div className="flex p-3 justify-between border-b border-[#f3f3f3]" key={`${hit.date}-${i}`}>
                <div className="flex-1 ">{`${splitElementArray(translateModelFields(model, e.path.substring(1)))}`}&nbsp;:</div>
                <div className="flex-1 text-center">
                  {(isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue) || <span className="text-coolGray-400 italic">Vide</span>}
                </div>
                <div className="text-center">
                  <HiArrowRight />
                </div>
                <div className="flex-1 text-center">{(isIsoDate(value) ? formatStringLongDate(value) : value) || "-"}</div>
              </div>
            );
          })
        : null}
    </div>
  );
};
