import React from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, hasAccessToReinscription, hasCompletedPhase1 } from "../../utils";
import { cohortAssignmentAnnouncementsIsOpenForYoung, getCohort } from "../../utils/cohorts";
import Affected from "./Affected";
import InscriptionClosedCLE from "./InscriptionClosedCLE";
import HomePhase2 from "./HomePhase2";
import Phase1NotDone from "./Phase1NotDone";
import WaitingReinscription from "./WaitingReinscription";
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
import AvenirCohort from "./AvenirCohort";
import { EQUIVALENCE_STATUS, isCohortTooOld, YOUNG_STATUS_PHASE3 } from "snu-lib";
import Loader from "@/components/Loader";
import { wasYoungExcluded, hasCompletedPhase2 } from "../../utils";
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
    if (isCohortTooOld(young) && !hasCompletedPhase2(young) && !hasMission && !hasEquivalence) {
      return <DelaiDepasse />;
    }
    if (hasWithdrawn) {
      return <Withdrawn />;
    }
    return <HomePhase2 />;
  }

  // Je peux me réinscrire :
  if (isReinscriptionOpen && hasAccessToReinscription(young, cohort)) {
    return <WaitingReinscription reinscriptionOpen={isReinscriptionOpen} />;
  }
  // Je n'ai pas validé ma phase 1 et la réinscription n'est pas ouverte (je peux changer de séjour):
  // Cet écran permet de changer de séjour ou se désister
  if ([YOUNG_STATUS.VALIDATED].includes(young.status) && young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) {
    return <Phase1NotDone />;
  }

  // je suis sur une cohorte à venir et la réinscription n'est pas ouverte
  if (young.cohort === "à venir") {
    return <AvenirCohort />; //moyen de faire encore mieux niveau merge
  }

  // Je me suis désisté et la reinscription est fermée
  if (hasWithdrawn) {
    return <Withdrawn />;
  }

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