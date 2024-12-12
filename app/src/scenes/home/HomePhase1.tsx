import React from "react";
import useAuth from "@/services/useAuth";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import WaitingValidation from "./waitingValidation";
import WaitingCorrection from "./waitingCorrection";
import WaitingList from "./waitingList";
import Affected from "./Affected";
import WaitingAffectation from "./waitingAffectation";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "@/utils/cohorts";

export default function HomePhase1() {
  const { young } = useAuth();
  if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
  if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrection />;
  if (young.status === YOUNG_STATUS.WAITING_LIST) return <WaitingList />;
  if (young.status === YOUNG_STATUS.VALIDATED && young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort))
    return <Affected />;
  return <WaitingAffectation />;
}
