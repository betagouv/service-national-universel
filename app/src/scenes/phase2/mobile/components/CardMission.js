import React from "react";
import { Link } from "react-router-dom";
import { translateApplicationForYoungs } from "../../../../utils";
import Clock from "../../../../assets/icons/Clock";

export default function application({ application }) {
  const theme = {
    background: {
      WAITING_VALIDATION: "bg-sky-100",
      WAITING_VERIFICATION: "bg-sky-100",
      WAITING_ACCEPTATION: "bg-orange-500",
      VALIDATED: "bg-[#71C784]",
      DONE: "bg-[#5694CD]",
      REFUSED: "bg-[#0B508F]",
      CANCEL: "bg-[#F4F4F4]",
      IN_PROGRESS: "bg-indigo-600",
      ABANDON: "bg-gray-50",
    },
    text: {
      WAITING_VALIDATION: "text-sky-600",
      WAITING_VERIFICATION: "text-sky-600",
      WAITING_ACCEPTATION: "text-white",
      VALIDATED: "text-white",
      DONE: "text-white",
      REFUSED: "text-white",
      CANCEL: "text-[#6B6B6B]",
      IN_PROGRESS: "text-white",
      ABANDON: "text-gray-400",
    },
    icon: {
      WAITING_VALIDATION: <Clock className="text-sky-400" />,
      WAITING_VERIFICATION: <Clock className="text-sky-400" />,
    },
  };
  return (
    <Link
      to={`/mission/${application.missionId}`}
      className="group flex w-56  shrink-0 flex-col items-start justify-start rounded-lg  bg-white p-3  pb-4 shadow-nina transition duration-100 ease-in">
      <div className={`flex items-center gap-1 text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} mb-2 rounded-sm px-2 py-[2px]`}>
        {theme.icon[application.status] ? theme.icon[application.status] : null}
        {translateApplicationForYoungs(application.status)}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-1 flex-col">
          <div className="mt-2 text-xs uppercase tracking-wider text-gray-500">{application.mission?.structureName}</div>
          <div className="mt-2 break-words text-sm font-bold">
            {application.missionName?.substring(0, 150)}
            {application.missionName?.length > 150 ? "..." : ""}
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">Voir ma candidature&nbsp;›</div>
      </div>
    </Link>
  );
}
