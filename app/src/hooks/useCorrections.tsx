import useAuth from "@/services/useAuth";
import { getCohort } from "@/utils/cohorts";
import { CORRECTION_MAP_CLE, CORRECTION_MAP_HTS } from "@/utils/correctionMaps";
import { CORRECTION_STEPS } from "@/utils/navigation";
import { CorrectionRequestType, YOUNG_STATUS, YoungType } from "snu-lib";

type stepType = keyof typeof CORRECTION_STEPS;

type correctionsType = {
  [key in keyof typeof CORRECTION_STEPS]?: string;
};

export default function useCorrections(step: stepType): correctionsType | CorrectionRequestType[] {
  const { young, isCLE }: { young: YoungType; isCLE: boolean } = useAuth();
  const cohort = getCohort(young.cohort);
  const correctionMap = isCLE ? CORRECTION_MAP_CLE : CORRECTION_MAP_HTS;

  function getCorrectionsByStep(): correctionsType | CorrectionRequestType[] {
    if (young.status !== YOUNG_STATUS.WAITING_CORRECTION) return {} as correctionsType;

    // Upload step is a special case b/c it has multiple pages
    if (step === CORRECTION_STEPS.UPLOAD) {
      return (
        young.correctionRequests?.filter(
          (e) => e.cohort === cohort.name && ["SENT", "REMINDED"].includes(e.status) && ["cniFile", "latestCNIFileExpirationDate", "latestCNIFileCategory"].includes(e.field),
        ) || ([] as CorrectionRequestType[])
      );
    }

    const keyList = correctionMap[step];
    if (!keyList) throw new Error("Invalid step");

    if (!young.correctionRequests) return {} as correctionsType;

    const corrections = young.correctionRequests.reduce((acc, curr) => {
      if (["SENT", "REMINDED"].includes(curr.status) && keyList.fields.includes(curr.field)) {
        acc[curr.field] = curr.message;
      }
      return acc;
    }, {} as correctionsType);

    return corrections;
  }

  return getCorrectionsByStep();
}
