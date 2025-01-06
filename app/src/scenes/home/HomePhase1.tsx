import React from "react";
import useAuth from "@/services/useAuth";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import Affected from "./Affected";
import WaitingAffectation from "./waitingAffectation";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "@/utils/cohorts";
import EnAttente from "./EnAttente";

export default function HomePhase1() {
  const { young } = useAuth();
  if ([YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST].includes(young.status)) return <EnAttente />;
  if (young.status === YOUNG_STATUS.VALIDATED && young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort))
    return <Affected />;
  return <WaitingAffectation />;
}
