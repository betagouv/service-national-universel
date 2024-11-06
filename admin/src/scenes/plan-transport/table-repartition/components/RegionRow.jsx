import React from "react";
import { useHistory } from "react-router-dom";

import { ROLES } from "snu-lib";

import Pencil from "@/assets/icons/Pencil";

import { Loading } from "../../components/commons";
import SelectHostRegion from "./SelectHostRegion";

export default function Region({ region, youngsInRegion, placesCenterByRegion, loadingQuery, onCreate, data, onDelete, cohort, user }) {
  const [open, setOpen] = React.useState(false);
  const [assignRegion, setAssignRegion] = React.useState([]);
  const [avancement, setAvancement] = React.useState(0);
  const editDisabled = !(user.role === ROLES.ADMIN || (user.role === ROLES.REFERENT_REGION && user.region === region));
  const history = useHistory();

  React.useEffect(() => {
    let assignRegion = data.filter((e) => e.fromRegion === region) || [];
    setAssignRegion(assignRegion);
    setAvancement(assignRegion.length ? assignRegion[0].avancement : 0);
  }, [data]);

  return (
    <>
      <hr />
      <div className="flex items-center px-4 py-2">
        <div
          className={`flex w-[30%] flex-col gap-1 ${assignRegion.length ? "cursor-pointer" : ""}`}
          onClick={() => assignRegion.length && history.push(`/table-repartition/regional?cohort=${cohort}&region=${region}`)}>
          <div className="text-base font-bold leading-6 text-[#242526]">{region}</div>
          <div className="flex items-center text-xs leading-4 text-gray-800">{loadingQuery ? <Loading width="w-1/3" /> : `${youngsInRegion} volontaires`}</div>
        </div>
        <div className="w-[60%]">
          {loadingQuery ? (
            <Loading width="w-1/3" />
          ) : (
            <div className="relative flex flex-row flex-wrap items-center gap-2">
              {assignRegion.map((assign, i) => (
                <div key={i + "assign"} className="rounded-full bg-gray-100 p-2 text-xs text-gray-700">
                  {assign.toRegion}
                </div>
              ))}
              {!editDisabled && (
                <>
                  {assignRegion.length === 0 ? (
                    <button className="cursor-pointer rounded-full bg-blue-600 px-2 py-1 text-xs leading-5 text-white hover:scale-105" onClick={() => setOpen(!open)}>
                      À assigner
                    </button>
                  ) : (
                    <div className="flex cursor-pointer items-center rounded-full bg-blue-600 p-2 hover:scale-105" onClick={() => setOpen(!open)}>
                      <Pencil className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {open ? (
                    <SelectHostRegion
                      region={region}
                      setOpen={setOpen}
                      placesCenterByRegion={placesCenterByRegion}
                      onCreate={onCreate}
                      assignRegion={assignRegion}
                      onDelete={onDelete}
                    />
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
        <div className="w-[10%] text-center">
          {loadingQuery ? (
            <Loading width="w-2/3" />
          ) : (
            <div className="flex justify-center">
              <div className={`rounded-lg px-2 py-1 text-xs font-bold uppercase leading-5 ${avancement === 100 ? "bg-[#E4F3EC] text-green-600" : "bg-[#E8EDFF] text-blue-600"}`}>
                {avancement} %
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
