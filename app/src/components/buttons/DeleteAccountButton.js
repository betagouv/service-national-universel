import React from "react";
import { Link } from "react-router-dom";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "snu-lib";

// This button could be a generic button
// It could be named `DangerOutlinedButton` for example
const DeleteAccountButton = ({ young }) => {
  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const inscriptionStatus = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);
  const getLabel = () => (mandatoryPhasesDone ? "Supprimer mon compte" : inscriptionStatus ? "Abandonner mon inscription" : "Se désister du SNU");

  return (
    <Link
      className="my-4 md:my-0 h-fit border-[1px] border-red-500 text-red-500 outline-none rounded-md font-semibold text-sm block w-auto py-[10px] px-10 hover:text-red-500"
      to="/desistement">
      {getLabel()}
    </Link>
  );
};

export default DeleteAccountButton;
