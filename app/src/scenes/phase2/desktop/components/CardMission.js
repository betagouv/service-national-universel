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
      className="group flex flex-col w-56 justify-start items-start shadow-nina rounded-lg bg-white pb-4 p-3 hover:-translate-y-1 transition duration-100 ease-in">
      <div className={`flex gap-1 items-center text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} px-2 py-[2px] rounded-sm mb-2`}>
        {theme.icon[application.status] ? theme.icon[application.status] : null}
        {translateApplicationForYoungs(application.status)}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-1 flex-col">
          <div className="text-gray-500 text-xs mt-2 uppercase">{application.mission?.structureName}</div>
          <div className="font-bold text-sm mt-2 break-words">
            {application.missionName?.substring(0, 150)}
            {application.missionName?.length > 150 ? "..." : ""}
          </div>
        </div>
        <div className="text-gray-500 text-xs mt-3">Voir ma candidature&nbsp;›</div>
      </div>
    </Link>
  );
}
