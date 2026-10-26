import { FEATURES_NAME, isFeatureEnabled, YOUNG_STATUS } from "snu-lib";
import { environment } from "@/config";

export function shouldForceRedirectToEmailValidation(user, cohort) {
  const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, environment);
  const shouldUserValidateEmail = user?.status === YOUNG_STATUS.IN_PROGRESS && user.emailVerified === "false" && new Date() < new Date(cohort?.inscriptionModificationEndDate);
  const pathname = window.location.pathname;
  return isEmailValidationEnabled && shouldUserValidateEmail && pathname !== "/preinscription/email-validation";
}
