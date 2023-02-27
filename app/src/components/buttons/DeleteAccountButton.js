import React from "react";
import { Link } from "react-router-dom";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "snu-lib";
import styled from "styled-components";

const DeleteAccountButton = ({ young }) => {
  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const inscriptionStatus = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);
  const getLabel = () => (mandatoryPhasesDone ? "Supprimer mon compte" : inscriptionStatus ? "Abandonner mon inscription" : "Se désister du SNU");

  return <OutlinedDangerLink to="/desistement">{getLabel()}</OutlinedDangerLink>;
};

export default DeleteAccountButton;

const OutlinedDangerLink = styled(Link)`
  @media (max-width: 767px) {
    margin: 1rem 0;
  }
  padding: 10px 40px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  display: block;
  width: auto;
  align-self: flex-end;
  border: 1px solid #ef4444;
  color: #ef4444;
  filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05));
  :hover {
    color: #ef4444;
  }
`;
