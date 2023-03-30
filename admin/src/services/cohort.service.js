import API from "./api";

export const getCohortByName = async (cohortName) => {
  try {
    const { ok, code, data } = await API.get(`/cohort/${cohortName}`);
    return data;
  } catch (error) {
    throw error;
  }
};
