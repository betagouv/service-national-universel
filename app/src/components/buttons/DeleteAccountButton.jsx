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
      className="my-2 block h-fit w-auto rounded-md border-[1px] border-red-500 py-[10px] px-10 text-sm font-medium text-red-500 outline-none hover:text-red-500 md:my-0"
      onClick={onClick}>
      {getLabel()}
    </button>
  );
};

export default DeleteAccountButton;
