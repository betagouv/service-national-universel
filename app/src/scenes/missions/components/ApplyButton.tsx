import React from "react";
import WithTooltip from "../../../components/WithTooltip";
import { FEATURES_NAME, isFeatureEnabled, MissionType } from "snu-lib";
import ApiEngagementTracker from "./ApiEngagementTracker";
import { environment } from "@/config";

type propTypes = {
  mission: MissionType & {
    message: string;
    canApply: boolean;
  };
  onClick: () => void;
};

const ApplyButton = ({ mission, onClick }: propTypes) => {
  const shouldDisplayApiTracker = !!mission.apiEngagementId && isFeatureEnabled(FEATURES_NAME.API_ENG_TRACKING, undefined, environment);

  return (
    <div className="flex flex-col gap-2 items-center">
      <WithTooltip tooltipText={mission.message}>
        <button disabled={!mission.canApply} className="rounded-lg bg-blue-600 px-12 py-2 text-sm text-white disabled:bg-blue-600/60" onClick={onClick}>
          Candidater
        </button>
      </WithTooltip>
      <p className="text-xs font-normal leading-none text-gray-500">{mission.placesLeft} places restantes</p>
      {shouldDisplayApiTracker && <ApiEngagementTracker missionId={mission.apiEngagementId} />}
    </div>
  );
};

export default ApplyButton;
