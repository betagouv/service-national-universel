import { PointDeRassemblementType } from "src";

export const getParticularitesAcces = (pdr: PointDeRassemblementType, cohortName?: string) => {
  if (!cohortName || !!pdr.matricule) {
    return pdr.particularitesAcces;
  }
  return pdr.particularitesAcces || pdr?.complementAddress.find((c) => c.cohort === cohortName)?.complement;
};
