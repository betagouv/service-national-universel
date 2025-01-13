import React from "react";
import { useSelector } from "react-redux";
import Done from "./scenes/done";
import Affected from "./scenes/affected/index";
import Cancel from "./cancel";
import WaitingAffectation from "./waitingAffectation";
import { YOUNG_STATUS_PHASE1, permissionPhase1 } from "../../utils";
import { useHistory } from "react-router-dom";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "../../utils/cohorts";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default () => {
  useDocumentTitle("Phase 1 - Séjour");

  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young || !permissionPhase1(young)) history.push("/");

  const renderStep = () => {
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE) return <Done />;
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED) {
      if (cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
        return <Affected />;
      } else {
        return <WaitingAffectation young={young} />;
      }
    }
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED && young.cohesion2020Step !== "DONE") return <Cancel />;
    return <WaitingAffectation young={young} />;
  };

  return renderStep();
};
