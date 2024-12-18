import { YOUNG_STATUS } from "../constants/constants";

export const getYoungStatusForBascule = (status: string) => {
  if (status === YOUNG_STATUS.NOT_AUTORISED || status === YOUNG_STATUS.IN_PROGRESS || status === YOUNG_STATUS.REINSCRIPTION) {
    return YOUNG_STATUS.IN_PROGRESS;
  } else return YOUNG_STATUS.WAITING_VALIDATION;
};
