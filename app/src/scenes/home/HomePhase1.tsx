import React from "react";
import useAuth from "@/services/useAuth";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import Affected from "./Affected";
import WaitingAffectation from "./waitingAffectation";
import useCohort from "@/services/useCohort";
import EnAttente from "./EnAttente";

export default function HomePhase1() {
  const { young } = useAuth();
  const { cohortAssignmentAnnouncementsIsOpenForYoung } = useCohort();

  if ([YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST].includes(young.status as any)) return <EnAttente />;
  if (young.status === YOUNG_STATUS.VALIDATED && young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung) return <Affected />;
  return <WaitingAffectation />;
}
