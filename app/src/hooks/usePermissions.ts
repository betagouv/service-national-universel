import useAuth from "@/services/useAuth";
import { YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";

export default function usePermissions() {
  const { young } = useAuth();

  return {
    hasAccessToAVenir: young.source === YOUNG_SOURCE.VOLONTAIRE,
    hasAccessToDesistement: young.status !== YOUNG_STATUS.WITHDRAWN && young.status !== YOUNG_STATUS.ABANDONED,
  };
}
