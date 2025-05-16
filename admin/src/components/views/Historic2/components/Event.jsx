import React from "react";
import { HiOutlineArrowRight } from "react-icons/hi";
import { formatLongDateFR, translateAction } from "snu-lib";
import { translateHistory, translateModelFields } from "../../../../utils";
import UserCard from "../../../UserCard";
import ReactTooltip from "react-tooltip";
import { getAuthorTooltip } from "@/utils";

export default function Event({ e, index, model }) {
  const tooltipActionId = `tooltip-action-${index}`;
  const tooltipAvantId = `tooltip-avant-${index}`;
  const tooltipApresId = `tooltip-apres-${index}`;
  const tooltipAuteurId = `tooltip-auteur-${index}`;

  return (
    <div key={index} className="flex cursor-default items-center px-4 py-3 hover:bg-slate-50">
      <div data-tip data-for={tooltipActionId} className="w-[25%]">
        <ReactTooltip id={tooltipActionId} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
          <div className="text-gray-700 text-xs font-[400] text-center mb-1">{translateModelFields(model, e.path)}</div>
        </ReactTooltip>
        <p className="text-gray-400">
          {translateAction(e.op)} • {formatLongDateFR(e.date)}
        </p>
        <p className="w-10/12 truncate hover:overflow-visible">{translateModelFields(model, e.path)}</p>
      </div>
      <div data-tip data-for={tooltipAvantId} className="w-[20%]">
        <ReactTooltip id={tooltipAvantId} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
          <div className="text-gray-700 text-xs font-[400] text-center mb-1">{translateHistory(e.path, e.originalValue)}</div>
        </ReactTooltip>
        <p className="w-10/12 truncate text-gray-400">{translateHistory(e.path, e.originalValue)}</p>
      </div>
      <div className="flex w-[10%] items-center justify-center">
        <HiOutlineArrowRight />
      </div>
      <div data-tip data-for={tooltipApresId} className="w-[20%]">
        <ReactTooltip id={tooltipApresId} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
          <div className="text-gray-700 text-xs font-[400] text-center mb-1">{translateHistory(e.path, e.value)}</div>
        </ReactTooltip>
        <p className="w-10/12 truncate text-gray-900">{translateHistory(e.path, e.value)}</p>
      </div>
      <div data-tip data-for={tooltipAuteurId} className="w-[25%]">
        <ReactTooltip id={tooltipAuteurId} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
          <div className="text-gray-700 text-xs font-[400] text-center mb-1">{getAuthorTooltip(e.user)}</div>
        </ReactTooltip>
        <UserCard user={e.user} />
      </div>
    </div>
  );
}
