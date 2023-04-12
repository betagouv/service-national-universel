import { ERRORS } from "snu-lib/errors";
import api from "./api";
import { translate } from "snu-lib";

export const logoutYoung = () => api.post("/young/logout");

export const deleteYoungAccount = (youngId) => api.put(`/young/${youngId}/soft-delete`);
export const withdrawYoungAccount = ({ withdrawnMessage, withdrawnReason }) => api.put(`/young/withdraw`, { withdrawnMessage, withdrawnReason });
export const abandonYoungAccount = ({ withdrawnMessage, withdrawnReason }) => api.put(`/young/abandon`, { withdrawnMessage, withdrawnReason });

export const updateYoung = async (youngDataToUpdate) => {
  try {
    const { ok, code, data } = await api.put("/young", youngDataToUpdate);
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

export const changeYoungPassword = async ({ password, newPassword, verifyPassword }) => {
  try {
    const { ok, code, user } = await api.post("/young/reset_password", { password, verifyPassword, newPassword });
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
