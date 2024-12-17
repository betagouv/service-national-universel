import { environment } from "@/config";
import useAuth from "@/services/useAuth";
import { getCohort } from "@/utils/cohorts";
import { FEATURES_NAME, isFeatureEnabled, YOUNG_STATUS, YoungType } from "snu-lib";
import usePermissions from "./usePermissions";

function shouldForceRedirectToEmailValidation(user: YoungType) {
  const cohort = getCohort(user.cohort);
  const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, environment);
  const shouldUserValidateEmail = user.status === YOUNG_STATUS.IN_PROGRESS && user.emailVerified === "false" && new Date() < new Date(cohort.inscriptionModificationEndDate);
  const pathname = window.location.pathname;
  return isEmailValidationEnabled && shouldUserValidateEmail && pathname !== "/preinscription/email-validation";
}

function shouldForceRedirectToReinscription(young: YoungType) {
  return young.cohort === "à venir" && [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status as any);
}

function shouldForceRedirectToInscription(young: YoungType, isInscriptionModificationOpen = false) {
  if (window.location.pathname === "/changer-de-sejour") return false;
  return (
    [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.REINSCRIPTION].includes(young.status as any) ||
    (isInscriptionModificationOpen &&
      young.status === YOUNG_STATUS.WAITING_VALIDATION &&
      ((young.hasStartedReinscription && young.reinscriptionStep2023 !== "DONE") || (!young.hasStartedReinscription && young.inscriptionStep2023 !== "DONE")))
  );
}

export default function useRedirects() {
  const { young } = useAuth();
  const { canModifyInscription } = usePermissions();
  return {
    shouldForceRedirectToEmailValidation: shouldForceRedirectToEmailValidation(young),
    shouldForceRedirectToReinscription: shouldForceRedirectToReinscription(young),
    shouldForceRedirectToInscription: shouldForceRedirectToInscription(young, canModifyInscription),
  };
}
