import { ERRORS, FILE_KEYS, MILITARY_FILE_KEYS, YoungType } from "snu-lib";
import api from "./api";
import { download, translate } from "snu-lib";

type ResponseType = {
  ok: boolean;
  data?: YoungType;
  code?: string;
};

export const logoutYoung = async () => await api.logout();

type WithdrawArgs = { withdrawnMessage?: string; withdrawnReason: string };
export const withdrawYoungAccount = ({ withdrawnMessage, withdrawnReason }: WithdrawArgs) => api.put(`/young/withdraw`, { withdrawnMessage, withdrawnReason });
export const abandonYoungAccount = ({ withdrawnMessage, withdrawnReason }: WithdrawArgs) => api.put(`/young/abandon`, { withdrawnMessage, withdrawnReason });

export const updateYoung = async (path: string, youngDataToUpdate: Partial<YoungType>) => {
  try {
    const { ok, code, data }: ResponseType = await api.put(`/young/account/${path}`, youngDataToUpdate);
    if (!ok && code === ERRORS.OPERATION_UNAUTHORIZED) {
      throw {
        title: `${translate(code)} :`,
        message: "Vous n'avez pas les droits pour effectuer cette action.",
      };
    }
    if (!ok) {
      throw {
        title: "Une erreur s'est produite :",
        message: translate(code),
      };
    }
    return {
      title: "Succès",
      message: "Votre profil a été mis à jour.",
      data,
    };
  } catch (error) {
    console.error(error);
    throw {
      title: "Oups, une erreur est survenue pendant la mise à jour de votre profil:",
      message: translate(error.code),
    };
  }
};

type ChangePasswordArgs = { password: string; newPassword: string; verifyPassword: string };

export const changeYoungPassword = async ({ password, newPassword, verifyPassword }: ChangePasswordArgs) => {
  try {
    const { ok, code, user }: ResponseType & { user: YoungType } = await api.post("/young/reset_password", { password, verifyPassword, newPassword });
    if (!ok) {
      throw {
        title: "Une erreur s'est produite :",
        message: translate(code),
      };
    }
    return {
      title: "Succès",
      message: "Votre mot de passe a été mis à jour.",
      data: user,
    };
  } catch (error) {
    console.error(error);
    throw {
      title: "Oups, une erreur est survenue pendant la mise à jour de votre profil:",
      message: translate(error.code),
    };
  }
};

const fileTypes = [...FILE_KEYS, ...MILITARY_FILE_KEYS];

type DownloadFileArgs = { youngId: string; fileId: string; fileType: (typeof fileTypes)[number] };

export const downloadYoungDocument = async ({ youngId, fileId, fileType }: DownloadFileArgs) => {
  try {
    const result = await api.get(`/young/${youngId}/documents/${fileType}/${fileId}`);
    const blob = new Blob([new Uint8Array(result.data.data)], { type: result.mimeType });
    download(blob, result.fileName);
    return {
      title: "Succès",
    };
  } catch (error) {
    console.error(error);
    throw {
      title: "Error",
      message: "Impossible de télécharger la pièce. Veuillez réessayer dans quelques instants.",
    };
  }
};

type ChangeCohortArgs = {
  reason: string;
  message?: string;
  cohortId?: string;
  cohortName?: string;
};

export const changeYoungCohort = async ({ reason, message, cohortId, cohortName }: ChangeCohortArgs) => {
  if (!cohortId && !cohortName) {
    throw new Error("cohortId or cohortName is required");
  }
  const { ok, data, code }: ResponseType = await api.put(`/young/change-cohort/`, {
    cohortChangeReason: reason,
    cohortDetailedChangeReason: message,
    cohortId,
    cohortName,
  });
  if (!ok) throw new Error(code);
  if (!data) throw new Error("No data");
  return data;
};
