import useAuth from "@/services/useAuth";
import { WAITING_CORRECTION_LINK, WAITING_CORRECTION_LINK_CLE } from "@/utils/correctionMaps";

export default function useCorrectionUrl(field: string) {
  const { isCLE } = useAuth();
  const correctionMap = isCLE ? WAITING_CORRECTION_LINK_CLE : WAITING_CORRECTION_LINK;

  const getUrlByCorrectionField = () => {
    const correction = correctionMap.find((correction) => correction.field.includes(field));
    if (!correction?.url) return "/";
    return correction.url;
  };

  return getUrlByCorrectionField();
}
