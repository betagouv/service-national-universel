import { YOUNG_SOURCE, YOUNG_STATUS, YOUNG_STATUS_PHASE2 } from "./constants/constants";
import { COHORTS } from "./constants/cohort";
import { CohortType } from "./mongoSchema/cohort";
import { YoungType } from "./mongoSchema/young";

const isCle = (young) => {
  return young.source === YOUNG_SOURCE.CLE;
};

// Campagne de recueil du consentement liée à la fermeture de la plateforme fin 2026 :
// sont concernés les volontaires (validés ou désistés) des cohortes 2024 et 2025 n'ayant pas validé leur phase 2.
const NON_ELIGIBLE_BANNER_COHORT_YEARS = ["2024", "2025"];
const NON_ELIGIBLE_BANNER_YOUNG_STATUS: string[] = [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN];

// L'année est extraite en UTC : côté front dateStart est une string ISO, côté API un objet Date.
const getCohortUTCYear = (dateStart?: Date | string | null): string | undefined => {
  if (!dateStart) return undefined;
  if (typeof dateStart === "string") return dateStart.slice(0, 4);
  return dateStart.toISOString().slice(0, 4);
};

const shouldDisplayNonEligibleBanner = (
  young?: Pick<YoungType, "status" | "statusPhase2"> | null,
  cohort?: (Pick<CohortType, "name"> & { dateStart?: Date | string | null }) | null,
): boolean => {
  if (!young || !cohort) return false;
  if (cohort.name === COHORTS.AVENIR) return false;
  const year = getCohortUTCYear(cohort.dateStart);
  if (!year || !NON_ELIGIBLE_BANNER_COHORT_YEARS.includes(year)) return false;
  if (!young.status || !NON_ELIGIBLE_BANNER_YOUNG_STATUS.includes(young.status)) return false;
  return young.statusPhase2 !== YOUNG_STATUS_PHASE2.VALIDATED;
};

export { isCle, shouldDisplayNonEligibleBanner };

export default { isCle, shouldDisplayNonEligibleBanner };
