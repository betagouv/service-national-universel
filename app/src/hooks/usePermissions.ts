import useAuth from "@/services/useAuth";
import useCohort from "@/services/useCohort";
import { canViewPhase2, permissionPhase1 } from "@/utils";
import { canCreateApplications, canCreateEquivalences, canViewMissions, hasAccessToReinscription, YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";

export default function usePermissions() {
  const { young } = useAuth();
  const { cohort } = useCohort();

  return {
    hasAccessToAVenir: young.source === YOUNG_SOURCE.VOLONTAIRE && cohort.name !== "à venir",
    hasAccessToDesistement: young.status !== YOUNG_STATUS.WITHDRAWN && young.status !== YOUNG_STATUS.ABANDONED,
    canModifyInscription: cohort.inscriptionModificationEndDate ? new Date() < new Date(cohort.inscriptionModificationEndDate) : false,
    hasAccessToReinscription: hasAccessToReinscription(young),
    hasAccessToNavigation: ![YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status as any),
    canViewPhase1: permissionPhase1(young),
    canViewPhase2: canViewPhase2(young, cohort),
    canViewMissions: canViewMissions(young, cohort),
    canCreateApplications: canCreateApplications(young, cohort),
    canCreateEquivalences: canCreateEquivalences(young),
  };
}
