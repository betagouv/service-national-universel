import { apiURL } from "@/config";
import API from "./api";
import { CohortGroupType, CohortType } from "snu-lib";

export const getAvailableSessions = async (): Promise<CohortType[]> => {
  const { ok, data: cohorts } = await API.get("/young/change-cohort");
  if (!ok || cohorts === undefined) {
    throw new Error("Impossible de récupérer les séjours disponibles");
  }
  return cohorts;
};

export const getCohortByName = async (cohortName: string) => {
  const { ok, data } = await API.get(`/cohort/${cohortName}`);
  if (!ok) return null;
  return data as CohortType;
};

export async function fetchOpenCohortGroups(): Promise<CohortGroupType[]> {
  return fetch(`${apiURL}/cohort-group/open`, {
    credentials: "include",
    headers: { "x-user-timezone": new Date().getTimezoneOffset().toString() },
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) throw new Error(res.code);
      return res.data;
    });
}
