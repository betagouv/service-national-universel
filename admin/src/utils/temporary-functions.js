import { ROLES } from "snu-lib";

export function isSchemaModificationAuthorized(user, cohort) {
  console.log("isSchemaModificationAuthorized: ", cohort);
  // QUICK & DIRTY
  // permet d'empêcher la modification par les référents régionaux des cohortes Février, Avril A et Avril B
  return user.role !== ROLES.REFERENT_REGION || !["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B"].includes(cohort);
}
