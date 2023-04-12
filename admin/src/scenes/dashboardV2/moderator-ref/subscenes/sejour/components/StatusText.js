import React from "react";
import MoreInfoPanel from "../../../../components/MoreInformationPanel";

export default function StatusText({ status, nb, percentage, infoPanel }) {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <div className="flex items-center gap-2 w-[80%] justify-start">
        <span className="font-bold text-lg text-gray-900 w-[20%]">{nb}</span>
        <p className="text-sm text-gray-600 text-left w-[80%] flex items-center">
          {status}
          {infoPanel && <MoreInfoPanel className="inline-block">{infoPanel}</MoreInfoPanel>}
        </p>
      </div>
      <p className="text-sm text-gray-400">({percentage}%)</p>
    </div>
  );
}
