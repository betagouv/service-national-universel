import React from "react";
import WithTooltip from "../../../components/WithTooltip";

const ApplyButton = ({ mission, onClick }) => {
  return (
    <div className="flex flex-col gap-2 items-center">
      <WithTooltip tooltipText={mission.message}>
        <button disabled={!mission.canApply} className="rounded-lg bg-blue-600 px-12 py-2 text-sm text-white disabled:bg-blue-600/60" onClick={onClick}>
          Candidater
        </button>
      </WithTooltip>
      <p className="text-xs font-normal leading-none text-gray-500">{mission.placesLeft} places restantes</p>
    </div>
  );
};

export default ApplyButton;
