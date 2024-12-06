import API from "./api";

export const getAvailableSessions = async () => {
  const { ok, data: cohorts } = await API.get("/young/change-cohort");
  if (!ok || cohorts === undefined) {
    throw new Error("Impossible de récupérer les séjours disponibles");
  }
  return cohorts;
};

export const getCohortByName = async (cohortName: string) => {
  const { ok, data } = await API.get(`/cohort/${cohortName}`);
  if (!ok) return null;
  return data;
};
