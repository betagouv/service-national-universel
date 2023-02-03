import React from "react";
import { HiOutlineArrowRight } from "react-icons/hi";
import { formatLongDateFR, translateAction } from "snu-lib";
import { translateHistory, translateModelFields } from "../../../../utils";
import UserCard from "../../../UserCard";

export default function Event({ e, index, model, refName, path }) {
  return (
    <tr key={index} className="border-t border-t-slate-100 hover:bg-slate-50 cursor-default">
      {refName && (
        <td className="px-4 py-3 cursor-pointer">
          <a href={`/${path}/${e.ref}`}>{e.ref}</a>
        </td>
      )}
      <td className="px-4 py-3">
        <p className="text-gray-400 truncate">
          {translateAction(e.op)} • {formatLongDateFR(e.date)}
        </p>
        <p>{translateModelFields(model, e.path)}</p>
      </td>
      <td className="px-4 py-3 truncate text-gray-400">{translateHistory(e.path, e.originalValue)}</td>
      <td className="px-4 py-3">
        <HiOutlineArrowRight />
      </td>
      <td className="px-4 py-3 truncate">{translateHistory(e.path, e.value)}</td>
      <td className="px-4 py-3">
        <UserCard user={e.user} />
      </td>
    </tr>
  );
}
