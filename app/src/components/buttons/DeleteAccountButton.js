import React from "react";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "snu-lib";

// This button could be a generic button
// It could be named `DangerOutlinedButton` for example
const DeleteAccountButton = ({ young, onClick }) => {
  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const inscriptionStatus = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);
  const getLabel = () => (mandatoryPhasesDone ? "Supprimer mon compte" : inscriptionStatus ? "Abandonner mon inscription" : "Se désister du SNU");

  return (
    <button
      className="my-2 md:my-0 h-fit border-[1px] border-red-500 text-red-500 outline-none rounded-md font-medium text-sm block w-auto py-[10px] px-10 hover:text-red-500"
      onClick={onClick}>
      {getLabel()}
    </button>
  );
};

export default DeleteAccountButton;
