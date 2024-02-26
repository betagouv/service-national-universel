import React from "react";
import WithTooltip from "../../../components/WithTooltip";

const ApplyButton = ({ authorization, handleClick }) => {
  return (
    <WithTooltip tooltipText={authorization.message}>
      <button disabled={!authorization.enabled} className="rounded-lg bg-blue-600 px-12 py-2 text-sm text-white disabled:bg-blue-600/60" onClick={handleClick}>
        Candidater
      </button>
    </WithTooltip>
  );
};

export default ApplyButton;
