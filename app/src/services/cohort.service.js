import API from "./api";

export const getAvailableSessions = async (young) => {
  const res = await API.post(`/cohort-session/eligibility/2023/${young._id}`);
  if (!res.ok) return [];
  return res.data;
};

export const getCohortByName = async (cohortName) => {
  const { ok, data } = await API.get(`/cohort/${cohortName}`);
  if (!ok) return null;
  return data;
};
