import useAuth from "@/services/useAuth";
import { CORRECTION_MAP_CLE, CORRECTION_MAP_HTS } from "@/utils/correctionMaps";

export default function useCorrectionUrl(field: string) {
  const { isCLE } = useAuth();
  const correctionMap = isCLE ? CORRECTION_MAP_CLE : CORRECTION_MAP_HTS;
  return Object.values(correctionMap).find((correction) => correction.fields.includes(field))?.url;
}
