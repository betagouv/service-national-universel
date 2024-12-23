import useAuth from "@/services/useAuth";
import { CORRECTION_MAP_CLE, CORRECTION_MAP_HTS } from "@/hooks/corrections/correctionMaps";
import { getCorrectionUrlByField } from "./correctionService";

export default function useCorrectionUrl(field: string): string {
  const { isCLE } = useAuth();
  const correctionMap = isCLE ? CORRECTION_MAP_CLE : CORRECTION_MAP_HTS;
  return getCorrectionUrlByField(correctionMap, field);
}
