import React from "react";
import WithTooltip from "../../../components/WithTooltip";

const ApplyButton = ({ mission, handleClick }) => {
  return (
    <WithTooltip tooltipText={mission.message}>
      <button disabled={!mission.canApply} className="rounded-lg bg-blue-600 px-12 py-2 text-sm text-white disabled:bg-blue-600/60" onClick={handleClick}>
        Candidater
      </button>
    </WithTooltip>
  );
};

export default ApplyButton;
