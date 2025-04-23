import useAuth from "@/services/useAuth";
import useCohort from "@/services/useCohort";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "@/utils/cohorts";
import { canViewPhase2, hasAccessToReinscription, YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";

export default function usePermissions() {
  const { young } = useAuth();
  const { cohort } = useCohort();

  return {
    hasAccessToAVenir: young.source === YOUNG_SOURCE.VOLONTAIRE && cohort.name !== "à venir",
    hasAccessToDesistement: young.status !== YOUNG_STATUS.WITHDRAWN && young.status !== YOUNG_STATUS.ABANDONED,
    canModifyInscription: cohort.inscriptionModificationEndDate ? new Date() < new Date(cohort.inscriptionModificationEndDate) : false,
    hasAccessToReinscription: hasAccessToReinscription(young),
    hasAccessToNavigation: ![YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status as any),
    canUpdatePSC1: !cohortAssignmentAnnouncementsIsOpenForYoung(cohort),
    canViewPhase2: canViewPhase2(young, cohort),
  };
}
