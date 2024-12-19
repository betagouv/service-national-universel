import useAuth from "@/services/useAuth";
import { CORRECTION_MAP_CLE, CORRECTION_MAP_HTS } from "./correctionMaps";
import { CorrectionRequestType, YOUNG_STATUS, YoungType } from "snu-lib";
import { CorrectionsMapByStep, getCorrectionsListByStep, getCorrectionsMapByStep, Step } from "./correctionService";

export default function useCorrections(step: Step): {
  correctionsMap: CorrectionsMapByStep;
  correctionsList: CorrectionRequestType[];
} {
  const { young, isCLE }: { young: YoungType; isCLE: boolean } = useAuth();
  const correctionMap = isCLE ? CORRECTION_MAP_CLE : CORRECTION_MAP_HTS;
  if (young.status !== YOUNG_STATUS.WAITING_CORRECTION) throw new Error("Invalid status");
  return {
    correctionsMap: getCorrectionsMapByStep(young, correctionMap, step),
    correctionsList: getCorrectionsListByStep(young, correctionMap, step),
  };
}
