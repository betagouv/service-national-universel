import React from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, hasCompletedPhase1 } from "../../utils";
import { cohortAssignmentAnnouncementsIsOpenForYoung, getCohort } from "../../utils/cohorts";
import Affected from "./Affected";
import InscriptionClosedCLE from "./InscriptionClosedCLE";
import HomePhase2 from "./HomePhase2";
import Phase1NotDone from "./Phase1NotDone";
import Default from "./default";
import RefusedV2 from "./refusedV2";
import WaitingAffectation from "./waitingAffectation";
import WaitingCorrection from "./waitingCorrection";
import WaitingValidation from "./waitingValidation";
import WaitingList from "./waitingList";
import Withdrawn from "./withdrawn";
import Excluded from "./Excluded";
import DelaiDepasse from "./DelaiDepasse";
import useAuth from "@/services/useAuth";
import { EQUIVALENCE_STATUS, isCohortTooOld, YOUNG_STATUS_PHASE3 } from "snu-lib";
import Loader from "@/components/Loader";
import { wasYoungExcluded, hasCompletedPhase2 } from "../../utils";

export default function Home() {
  useDocumentTitle("Accueil");
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);

  if (!young || !cohort) return <Loader />;

  // Je ne peux plus participer au SNU (exclu, refusé) :
  if (wasYoungExcluded(young)) return <Excluded />;
  if (young.status === YOUNG_STATUS.REFUSED) return <RefusedV2 />;

  // Phase 3
  if ([YOUNG_STATUS_PHASE3.WAITING_VALIDATION, YOUNG_STATUS_PHASE3.VALIDATED].includes(young.statusPhase3)) {
    return <Default />;
  }

  // Je peux accéder à la Homepage de la Phase 2 si j'ai validé ma phase 1 et que ma cohorte me permet encore de faire la phase 2 :
  const hasMission = young.phase2ApplicationStatus.some((status) => ["VALIDATED", "IN_PROGRESS"].includes(status));
  const hasEquivalence = [EQUIVALENCE_STATUS.WAITING_CORRECTION, EQUIVALENCE_STATUS.WAITING_VERIFICATION].includes(young.status_equivalence);
  const hasWithdrawn = [YOUNG_STATUS.WITHDRAWN, YOUNG_STATUS.ABANDONED].includes(young.status);

  if (hasCompletedPhase1(young)) {
    // les volontaires des première cohortes n'ont plus le droit de faire la phase 2 SAUF si ils l'ont commencé
    if (isCohortTooOld(cohort) && !hasCompletedPhase2(young) && !hasMission && !hasEquivalence) {
      return <DelaiDepasse />;
    }
    if (hasWithdrawn) {
      return <Withdrawn />;
    }
    return <HomePhase2 />;
  }

  if (hasWithdrawn) {
    return <Withdrawn />;
  }

  console.log("🚀 ~ Home ~ cohort.endDate:", cohort.dateEnd);
  if (new Date() > new Date(cohort.dateEnd)) {
    return <Phase1NotDone />;
  }

  return <HomePhase1 />;
}

function HomePhase1() {
  const { young, isCLE } = useAuth();
  const cohort = getCohort(young.cohort);

  // Ma phase 1 est en cours, soit en cours d'inscription, soit en plein parcours
  const isCohortInstructionOpen = new Date() < new Date(cohort.instructionEndDate);
  if (isCLE && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status) && !isCohortInstructionOpen) {
    return <InscriptionClosedCLE />;
  }
  // Mon inscription est en cours :
  if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
  if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrection />;
  // Je suis en liste complémentaire sur une cohorte
  if (young.status === YOUNG_STATUS.WAITING_LIST) return <WaitingList />;
  // Mon dossier est validé, je suis en attente d'affectation ou affecté
  if (young.status === YOUNG_STATUS.VALIDATED) {
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
      // Je suis affecté à un centre
      return <Affected />;
    } else {
      // Je suis en attente d'affectation à un centre
      return <WaitingAffectation />;
    }
  }
  // Fallback
  return <Default />;
}
