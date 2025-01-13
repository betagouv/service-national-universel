import React from "react";
import { Redirect } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { YOUNG_STATUS, hasCompletedPhase1, isDoingPhase1 } from "../../utils";
import { getCohort } from "../../utils/cohorts";
import InscriptionClosedCLE from "./InscriptionClosedCLE";
import HomePhase2 from "./HomePhase2";
import Phase1NotDone from "./Phase1NotDone";
import WaitingReinscription from "./WaitingReinscription";
import Default from "./default";
import RefusedV2 from "./refusedV2";
import HomePhase1 from "./HomePhase1";
import Withdrawn from "./withdrawn";
import Excluded from "./Excluded";
import DelaiDepasse from "./DelaiDepasse";
import useAuth from "@/services/useAuth";
import { EQUIVALENCE_STATUS, isCohortTooOld, YOUNG_STATUS_PHASE3 } from "snu-lib";
import Loader from "@/components/Loader";
import { wasYoungExcluded, hasCompletedPhase2 } from "../../utils";
import useReinscription from "../changeSejour/lib/useReinscription";
import { shouldRedirectToReinscription } from "@/utils/navigation";
import usePermissions from "@/hooks/usePermissions";

export default function Home() {
  useDocumentTitle("Accueil");
  const { young, isCLE } = useAuth();
  const cohort = getCohort(young.cohort);
  const { hasAccessToReinscription } = usePermissions();

  const { data: isReinscriptionOpen, isLoading: isReinscriptionOpenLoading } = useReinscription();

  if (!young || !cohort || isReinscriptionOpenLoading) return <Loader />;

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

  if (hasAccessToReinscription && isReinscriptionOpen && !shouldRedirectToReinscription(young)) {
    return <WaitingReinscription />;
  }
  if (hasAccessToReinscription) {
    return <Redirect to="/reinscription" />;
  }

  // Ma phase 1 est en cours, soit en cours d'inscription, soit en plein parcours
  const isCohortInstructionOpen = new Date() < new Date(cohort.instructionEndDate);
  if (isCLE && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status) && !isCohortInstructionOpen) {
    return <InscriptionClosedCLE />;
  }

  if (isDoingPhase1(young)) {
    return <HomePhase1 />;
  }
  return <Phase1NotDone />;
}
