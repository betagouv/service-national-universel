import React from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, hasAccessToReinscription, reInscriptionOpenForYoungs } from "../../utils";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "../../utils/cohorts";
import Banner from "./components/banner";
import Default from "./default";
import HomePhase2 from "./HomePhase2";
import RefusedV2 from "./refusedV2";
import ValidatedV2 from "./validatedV2";
import Affected from "./Affected";
import WaitingCorrectionV2 from "./waitingCorrectionV2";
import WaitingList from "./waitingList";
import WaitingReinscription from "./WaitingReinscription";
import WaitingReinscriptionOld from "./WaitingReinscriptionOld";
import WaitingValidation from "./waitingValidation";
import Withdrawn from "./withdrawn";
import Phase1NotDone from "./Phase1NotDone";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import FutureCohort from "./FutureCohort";
import { environment } from "@/config";

export default function Home() {
  useDocumentTitle("Accueil");
  const young = useSelector((state) => state.Auth.young);

  if (!young) return <Redirect to="/auth" />;

  const renderStep = () => {
    if (young.status === YOUNG_STATUS.ABANDONED)
      return (
        <>
          {young.cohort === "2021" ? <Banner /> : null}
          <Withdrawn />
        </>
      );
    if (young.status === YOUNG_STATUS.WITHDRAWN)
      return (
        <>
          {young.cohort === "2021" ? <Banner /> : null}
          <Withdrawn />
        </>
      );

    if (young.status === YOUNG_STATUS.WAITING_LIST && !["2022", "Février 2022", "Juin 2022", "Juillet 2022", "à venir"].includes(young.cohort))
      return (
        <>
          {young.cohort === "2021" ? <Banner /> : null}
          <WaitingList />
        </>
      );
    if (young.status === YOUNG_STATUS.REFUSED)
      return (
        <>
          {young.cohort === "2021" ? <Banner /> : null}
          <RefusedV2 />
        </>
      );
    if (hasAccessToReinscription(young)) {
      // @todo: WaitingReinscriptionOld should be deleted and WaitingReinscription updated to handle both cases
      return reInscriptionOpenForYoungs(environment) ? <WaitingReinscription /> : <WaitingReinscriptionOld />;
    }
    if (
      young.status === YOUNG_STATUS.VALIDATED &&
      [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1) &&
      [YOUNG_STATUS_PHASE2.IN_PROGRESS, YOUNG_STATUS_PHASE2.WAITING_REALISATION].includes(young.statusPhase2)
    ) {
      return <HomePhase2 />;
    }

    if (young.status === YOUNG_STATUS.VALIDATED && young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) {
      return <Phase1NotDone />;
    }

    if (["Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"].includes(young.cohort)) {
      // they are in the new cohort, we display the inscription step
      if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrectionV2 />;
      if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
      if (young.status === YOUNG_STATUS.VALIDATED) {
        if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
          return <Affected />;
        } else {
          return <ValidatedV2 />;
        }
      }
    }

    if (young.cohort === "à venir" && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status)) {
      return <FutureCohort />;
    }

    return <Default />;
  };

  return renderStep();
}
