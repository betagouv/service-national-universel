import { React, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { getCohortNames, hasAccessToReinscription } from "../../utils";
import { cohortAssignmentAnnouncementsIsOpenForYoung, getCohort } from "../../utils/cohorts";
import Affected from "./Affected";
import FutureCohort from "./FutureCohort";
import InscriptionClosedCLE from "./InscriptionClosedCLE";
import HomePhase2 from "./HomePhase2";
import Phase1NotDone from "./Phase1NotDone";
import WaitingReinscription from "./WaitingReinscription";
import Default from "./default";
import RefusedV2 from "./refusedV2";
import Validated from "./validated";
import WaitingCorrection from "./waitingCorrection";
import WaitingValidation from "./waitingValidation";
import WaitingList from "./waitingList";
import Withdrawn from "./withdrawn";
import Excluded from "./Excluded";
import DelaiDepasse from "./DelaiDepasse";
import useAuth from "@/services/useAuth";
import AvenirCohort from "./AvenirCohort";
import AvenirCohortv2 from "./AvenirCohortV2";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, isCohortTooOld } from "snu-lib";
import Loader from "@/components/Loader";
import { wasYoungExcluded, hasAccessToPhase2, hasCompletedPhase2 } from "../../utils";
import { fetchReInscriptionOpen } from "../../services/reinscription.service";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  useDocumentTitle("Accueil");
  const { young, isCLE } = useAuth();
  const cohort = getCohort(young.cohort);

  const { data: isReinscriptionOpen, isLoading: isReinscriptionOpenLoading } = useQuery({
    queryKey: ["isReInscriptionOpen"],
    queryFn: fetchReInscriptionOpen,
  });

  if (isReinscriptionOpenLoading) return <Loader />;

  if (!young) return <Redirect to="/auth" />;

  const renderStep = () => {
    // Je ne peux plus participer au SNU :
    if (wasYoungExcluded(young)) return <Excluded />;
    if (young.status === YOUNG_STATUS.REFUSED) return <RefusedV2 />;

    // -------------------
    // placer le default ici qui est en fait la phase 3 (hasAccessToPhase2 ?)
    // -------------------

    // Je peux accéder à la Homepage de la Phase 2 si lj'ai validé ma phase 1 et que ma cohorte me permet encore de faire la phase 2 :
    const hasMission = young.phase2ApplicationStatus.some((status) => ["VALIDATED", "IN_PROGRESS"].includes(status));
    if ([YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1)) {
      if (isCohortTooOld(young) && !hasCompletedPhase2(young) && !hasMission) {
        return <DelaiDepasse />;
      }
      return <HomePhase2 />;
    }

    // Je peux me réinscrire :
    if (isReinscriptionOpen && hasAccessToReinscription(young)) {
      return <WaitingReinscription reinscriptionOpen={isReinscriptionOpen} />;
    }
    // Je n'ai pas validé ma phase 1 et la réinscription n'est pas ouverte (je peux changer de séjour):
    if ([YOUNG_STATUS.VALIDATED].includes(young.status) && young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) {
      return <Phase1NotDone />;
    }

    // je suis sur une cohorte à venir et la réinscription n'est pas ouverte
    if (young.cohort === "à venir") {
      return <AvenirCohortv2 />; //moyen de faire encore mieux niveau merge
    }
    // if (young.cohort === "à venir" && [YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.VALIDATED].includes(young.status)) {
    //   return <AvenirCohort />;
    // }
    // if (young.cohort === "à venir" && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status)) {
    //   return <FutureCohort />;
    // }

    const hasWithdrawn = [YOUNG_STATUS.WITHDRAWN, YOUNG_STATUS.ABANDONED].includes(young.status);
    if (hasWithdrawn) {
      return <Withdrawn />;
    }

    if (young.status === YOUNG_STATUS.WAITING_LIST) return <WaitingList />;

    if (getCohortNames(true, false, false).includes(young.cohort) && ![YOUNG_STATUS_PHASE1.DONE].includes(young.statusPhase1)) {
      // they are in the new cohort, we display the inscription step
      const isCohortInstructionOpen = new Date() < new Date(cohort.instructionEndDate);
      if (isCLE && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status) && !isCohortInstructionOpen) {
        return <InscriptionClosedCLE />;
      }
      // Mon inscription est en cours :
      if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
      if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrection />;
      if (young.status === YOUNG_STATUS.VALIDATED) {
        if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
          return <Affected />;
        } else {
          return <Validated />;
        }
      }
    }

    return <Default />;
  };

  return renderStep();
}
