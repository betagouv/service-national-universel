import { CohortsRoutes, YoungType } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

import API from "./api";

export const getAvailableSessions = async (young: YoungType) => {
  const { ok, data: cohorts } = await buildRequest<CohortsRoutes["PostEligibility"]>({
    path: "/cohort-session/eligibility/2023/{id?}",
    method: "POST",
    params: { id: young._id },
  })();
  if (!ok || cohorts === undefined) {
    throw new Error("Impossible de récupérer les sessions disponibles");
  }
  return cohorts;
};

export const getCohortByName = async (cohortName: string) => {
  const { ok, data } = await API.get(`/cohort/${cohortName}`);
  if (!ok) return null;
  return data;
};
