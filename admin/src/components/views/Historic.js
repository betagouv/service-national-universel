import React, { useState, useEffect } from "react";

import { formatStringLongDate, translateModelFields, translate } from "../../utils";
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
            const originalValue = translate(JSON.stringify(e.originalValue)?.replace(/"/g, ""));
            const value = translate(JSON.stringify(e.value)?.replace(/"/g, ""));
            return (
              <div className="flex p-3 justify-between" key={`${hit.date}-${i}`}>
                <div className="flex-1 ">{`${translateModelFields(model, e.path.substring(1))}`}&nbsp;:</div>
                <div className="flex-1 text-center">
                  {(isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue) || <span className="text-coolGray-500 italic">Vide</span>}
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
