import React from "react";
import useAuth from "@/services/useAuth";
import Done from "./scenes/done";
import Affected from "./scenes/affected/index";
import Cancel from "./cancel";
import WaitingAffectation from "./waitingAffectation";
import { YOUNG_STATUS_PHASE1, permissionPhase1 } from "../../utils";
import { Redirect } from "react-router-dom";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "../../utils/cohorts";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function Phase1() {
  useDocumentTitle("Phase 1 - Séjour");
  const { young } = useAuth();

  if (!young || !permissionPhase1(young)) return <Redirect to="/" />;
  if (young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE) return <Done />;
  if (young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED && young.cohesion2020Step !== "DONE") return <Cancel />;
  if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) return <Affected />;
  return <WaitingAffectation young={young} />;
}
