import { canCreateApplications, CohortDto, CohortType, isInRuralArea, translate, YoungType } from "snu-lib";

export function getProjetPro(young: YoungType) {
  if (young.professionnalProject === "UNIFORM") return translate("UNIFORM");
  if (young.professionnalProject === "OTHER") return young.professionnalProjectPrecision;
  return "Non renseigné";
}

export function getTags(young: YoungType) {
  const temp: string[] = [];
  if (young.handicap === "true") temp.push("Handicap");
  if (isInRuralArea(young) === "true") temp.push("Zone rurale");
  return temp;
}

export function canCreateApplicationForYoung(young: YoungType, cohort?: CohortDto) {
  if (!cohort) return false;
  return canCreateApplications(young, cohort as CohortType);
}
