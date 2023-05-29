import React from "react";
import { HiOutlineArrowRight } from "react-icons/hi";
import { formatLongDateFR, translateAction } from "snu-lib";
import { translateHistory, translateModelFields } from "../../../../utils";
import UserCard from "../../../UserCard";

export default function Event({ e, index, model }) {
  return (
    <div key={index} className="flex cursor-default items-center px-4 py-3 hover:bg-slate-50">
      <div className="w-[25%]">
        <p className="text-gray-400">
          {translateAction(e.op)} • {formatLongDateFR(e.date)}
        </p>
        <p className="w-10/12 truncate hover:overflow-visible">{translateModelFields(model, e.path)}</p>
      </div>
      <div className="w-[20%]">
        <p className="w-10/12 truncate text-gray-400">{translateHistory(e.path, e.originalValue)}</p>
      </div>
      <div className="flex w-[10%] items-center justify-center">
        <HiOutlineArrowRight />
      </div>
      <div className="w-[20%]">
        <p className="w-10/12 truncate text-gray-900">{translateHistory(e.path, e.value)}</p>
      </div>
      <div className="w-[25%]">
        <UserCard user={e.user} />
      </div>
    </div>
  );
}
