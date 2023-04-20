import { translate } from "snu-lib";
import { ERRORS } from "snu-lib/errors";
import API from "./api";

export const deleteYoungAccount = async (youngId) => {
  try {
    const { ok, code, data } = await API.put(`/young/${youngId}/soft-delete`);
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
      message: "Ce(tte) volontaire a été supprimé(e).",
      data,
    };
  } catch (error) {
    console.error(error);
    throw {
      title: "Oups, une erreur est survenue pendant la supression du (de la) volontaire :",
      message: translate(error.code),
    };
  }
};

export const updateYoungPhase1Agreement = async ({ youngId, isAgree }) => {
  try {
    const { data, ok, code } = await API.post(`/young/${youngId}/phase1/youngPhase1Agreement`, { value: isAgree });
    if (!ok) {
      throw {
        title: "Une erreur s'est produite :",
        message: translate(code),
      };
    }
    return {
      title: "Succès",
      message: "Le statut du (de la) volontaire a bien été mis à jour.",
      data,
    };
  } catch (error) {
    console.error(error);
    throw {
      title: "Oups, une erreur est survenue pendant la supression du (de la) volontaire :",
      message: translate(error.code),
    };
  }
};
