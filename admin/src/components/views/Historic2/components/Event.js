import React from "react";
import { HiOutlineArrowRight } from "react-icons/hi";
import { formatLongDateFR, translateAction } from "snu-lib";
import { translateHistory, translateModelFields } from "../../../../utils";
import UserCard from "../../../UserCard";

export default function Event({ e, index, model }) {
  return (
    <div key={index} className="flex items-center hover:bg-slate-50 cursor-default px-4 py-3">
      <div className="w-[25%]">
        <p className="text-gray-400">
          {translateAction(e.op)} • {formatLongDateFR(e.date)}
        </p>
        <p className="max-w-xs truncate">{translateModelFields(model, e.path)}</p>
      </div>
      <div className="w-[20%] truncate text-gray-400">{translateHistory(e.path, e.originalValue)}</div>
      <div className="w-[10%]">
        <HiOutlineArrowRight />
      </div>
      <div className="w-[20%] truncate">{translateHistory(e.path, e.value)}</div>
      <div className="w-[25%]">
        <UserCard user={e.user} />
      </div>
    </div>
  );
}
