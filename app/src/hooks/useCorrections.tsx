import useAuth from "@/services/useAuth";
import { getCohort } from "@/utils/cohorts";
import { WAITING_CORRECTION_LINK, WAITING_CORRECTION_LINK_CLE } from "@/utils/correctionMaps";
import { CORRECTION_STEPS } from "@/utils/navigation";
import { CorrectionRequestType, YOUNG_STATUS } from "snu-lib";

type stepType = keyof typeof CORRECTION_STEPS;

export default function useCorrections(step: stepType) {
  const { young, isCLE } = useAuth();
  const cohort = getCohort(young.cohort);
  const correctionMap = isCLE ? WAITING_CORRECTION_LINK_CLE : WAITING_CORRECTION_LINK;

  const getCorrectionsByStep = () => {
    if (young.status !== YOUNG_STATUS.WAITING_CORRECTION) return [];

    if (step === CORRECTION_STEPS.UPLOAD) {
      return young.correctionRequests?.filter(
        (e: CorrectionRequestType) =>
          e.cohort === cohort.name && ["SENT", "REMINDED"].includes(e.status) && ["cniFile", "latestCNIFileExpirationDate", "latestCNIFileCategory"].includes(e.field),
      );
    }

    const keyList = correctionMap.find((link) => link.step === step);
    const corrections = young?.correctionRequests.reduce((acc, curr) => {
      if (["SENT", "REMINDED"].includes(curr.status) && keyList?.field.includes(curr.field)) {
        acc[curr.field] = curr.message;
      }
      return acc;
    }, {});
    return corrections;
  };

  return getCorrectionsByStep();
}
