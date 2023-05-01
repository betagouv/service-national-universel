import { translate } from "snu-lib";
import API from "./api";

export const getCohortByName = async (cohortName) => {
  try {
    const { ok, code, data } = await API.get(`/cohort/${cohortName}`);
    if (!ok) {
      throw {
        title: "Une erreur s'est produite :",
        message: translate(code),
      };
    }
    return {
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
