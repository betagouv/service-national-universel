import React from "react";
import useUpdateMPStatus from "@/scenes/militaryPreparation/lib/useUpdateMPStatus";
import useAuth from "@/services/useAuth";
import { APPLICATION_STATUS, MILITARY_PREPARATION_FILES_STATUS } from "snu-lib";
import ReactTooltip from "react-tooltip";
import { BiCheckCircle } from "react-icons/bi";
import useUpdateApplicationStatus from "@/scenes/phase2/lib/useUpdateApplicationStatus";
import { MissionAndApplicationType } from "@/scenes/phase2/engagement.repository";

export default function AcceptButton({ mission }: { mission: MissionAndApplicationType }) {
  const { young } = useAuth();
  const { mutate: updateMPStatus, isPending: isMPPending } = useUpdateMPStatus();
  const { mutate: updateApplicationStatus, isPending: isApplicationPending } = useUpdateApplicationStatus(mission.application!._id);

  function handleClick() {
    if (mission.isMilitaryPreparation === "true") {
      updateMilitaryPreparationAndApplicationStatus();
    } else {
      updateApplicationStatus(APPLICATION_STATUS.WAITING_VALIDATION);
    }
  }

  function updateMilitaryPreparationAndApplicationStatus() {
    if (!young.statusMilitaryPreparationFiles) {
      updateMPStatus(MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION);
    }
    if (young.statusMilitaryPreparationFiles === MILITARY_PREPARATION_FILES_STATUS.VALIDATED) {
      updateApplicationStatus(APPLICATION_STATUS.WAITING_VALIDATION);
    } else {
      updateApplicationStatus(APPLICATION_STATUS.WAITING_VERIFICATION);
    }
  }

  return (
    <>
      {mission.message ? (
        <ReactTooltip id="candidater-pm" className="!rounded-lg bg-white text-gray-800 !opacity-100 shadow-xl max-w-sm" arrowColor="white">
          <p className="text-gray-800">{mission.message}</p>
        </ReactTooltip>
      ) : null}
      <button
        data-tip
        data-for="candidater-pm"
        className="flex gap-2 text-white rounded-lg bg-blue-600 px-4 py-2 transition duration-300 ease-in-out hover:bg-blue-500 disabled:bg-blue-400"
        disabled={!mission.canApply || isMPPending || isApplicationPending}
        onClick={handleClick}>
        <BiCheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium leading-5 text-white">Accepter</span>
      </button>
    </>
  );
}
