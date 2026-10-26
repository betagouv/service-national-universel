import api from "@/services/api";
import { isCle, SENDINBLUE_TEMPLATES, YOUNG_PHASE, YOUNG_STATUS, YoungType } from "snu-lib";

export async function updateYoung(youngId: string, payload: any): Promise<YoungType> {
  const { ok, data, code } = await api.put(`/referent/young/${youngId}`, payload);
  if (!ok) throw new Error(code);
  return data;
}

// TODO: move to api
export async function notifyYoungStatusChanged(young: YoungType, prevStatus: string) {
  const validationTemplate = isCle(young) ? SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED_CLE : SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED;

  if (young.status === YOUNG_STATUS.VALIDATED && young.phase === YOUNG_PHASE.INSCRIPTION) {
    if (prevStatus === "WITHDRAWN") await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_REACTIVATED}`);
    else await api.post(`/young/${young._id}/email/${validationTemplate}`);
  }
  if (young.status === YOUNG_STATUS.WAITING_LIST) {
    await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_LIST}`);
  }
}
