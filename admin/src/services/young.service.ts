import { translate, ERRORS } from "snu-lib";
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

export const getYoungCountByCohort = async (cohortName: string, filters = {}) => {
  const data = await API.post(`/elasticsearch/young/search?tab=volontaire`, {
    filters: {
      cohort: [cohortName],
      ...filters,
    },
  });
  if (!data.took) {
    console.log(data);
    throw new Error(data.code);
  }
  return data.responses?.[0]?.hits?.total?.value;
};
