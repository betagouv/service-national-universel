import React from "react";
import { FEATURES_NAME, isFeatureEnabled } from "snu-lib";
import ApiEngagementTracker from "./ApiEngagementTracker";
import { environment } from "@/config";
import ReactTooltip from "react-tooltip";
import plausibleEvent from "@/services/plausible";
import ApplyModal from "./ApplyModal";
import ApplyDoneModal from "./ApplyDoneModal";
import { queryClient } from "@/services/react-query";
import { MissionAndApplicationType } from "@/scenes/phase2/engagement.repository";

const ApplyButton = ({ mission }: { mission: MissionAndApplicationType }) => {
  const [modal, setModal] = React.useState<string | null>(null);
  const shouldDisplayApiTracker = !!mission.apiEngagementId && isFeatureEnabled(FEATURES_NAME.API_ENG_TRACKING, undefined, environment);

  const handleClick = () => {
    if (mission.isMilitaryPreparation === "true") {
      plausibleEvent("Phase 2/CTA - PM - Candidater");
    } else {
      plausibleEvent("Phase2/CTA missions - Candidater");
    }
    setModal("APPLY");
  };

  function handleChange() {
    setModal(null);
    queryClient.invalidateQueries({ queryKey: ["mission", mission._id] });
  }

  return (
    <>
      {modal === "APPLY" && <ApplyModal value={mission} onChange={() => setModal(null)} onCancel={() => setModal(null)} onSend={() => setModal("DONE")} />}
      {modal === "DONE" && <ApplyDoneModal value={mission} onChange={handleChange} />}
      <div className="flex flex-col gap-2 items-center">
        {mission.message ? (
          <ReactTooltip id="candidater" className="!rounded-lg bg-white text-gray-800 !opacity-100 shadow-xl max-w-sm" arrowColor="white">
            <p className="text-gray-800">{mission.message}</p>
          </ReactTooltip>
        ) : null}
        <button
          data-tip
          data-for="candidater"
          disabled={!mission.canApply}
          className="rounded-lg bg-blue-600 px-12 py-2 text-sm text-white disabled:bg-blue-600/60"
          onClick={handleClick}>
          Candidater
        </button>
        <p className="text-xs font-normal leading-none text-gray-500">{mission.placesLeft} places restantes</p>
        {shouldDisplayApiTracker && <ApiEngagementTracker missionId={mission.apiEngagementId} />}
      </div>
    </>
  );
};

export default ApplyButton;
