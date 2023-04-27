import React from "react";
import MoreInfoPanel from "../../../../components/ui/MoreInformationPanel";

export default function StatusText({ status, nb, percentage, infoPanel, onClick = () => {} }) {
  return (
    <div className="flex w-full items-center justify-between gap-2" onClick={() => onClick({ status, nb })}>
      <div className="flex w-[80%] items-center justify-start gap-2">
        <span className="w-[20%] text-lg font-bold text-gray-900">{nb}</span>
        <div className="flex w-[80%] items-center text-left text-sm text-gray-600">
          {status}
          {infoPanel && <MoreInfoPanel className="inline-block">{infoPanel}</MoreInfoPanel>}
        </div>
      </div>
      <p className="text-sm text-gray-400">({percentage}%)</p>
    </div>
  );
}
