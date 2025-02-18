import React from "react";
import useUpdateMPStatus from "@/scenes/militaryPreparation/lib/useUpdateMPStatus";
import useAuth from "@/services/useAuth";
import { toastr } from "react-redux-toastr";
import { APPLICATION_STATUS, MILITARY_PREPARATION_FILES_STATUS } from "snu-lib";
import ReactTooltip from "react-tooltip";
import { BiCheckCircle } from "react-icons/bi";

export default function AcceptButton({ mission, loading, updateApplication }) {
  const { young } = useAuth();
  const { mutate, isPending } = useUpdateMPStatus();

  async function handleClick() {
    try {
      if (mission.isMilitaryPreparation === "true") {
        if (!young.statusMilitaryPreparationFiles) {
          mutate(MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION);
        }
        if (young.statusMilitaryPreparationFiles === MILITARY_PREPARATION_FILES_STATUS.VALIDATED) {
          await updateApplication(APPLICATION_STATUS.WAITING_VALIDATION);
        } else {
          await updateApplication(APPLICATION_STATUS.WAITING_VERIFICATION);
        }
      } else {
        await updateApplication(APPLICATION_STATUS.WAITING_VALIDATION);
      }
    } catch (e) {
      console.log(e);
      toastr.error("Oups", "Une erreur est survenue lors de la mise à jour de la candidature.");
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
        disabled={!mission.canApply || loading || isPending}
        onClick={handleClick}>
        <BiCheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium leading-5 text-white">Accepter</span>
      </button>
    </>
  );
}
