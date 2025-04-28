import { useQuery } from "@tanstack/react-query";
import API from "@/services/api";
import { ROLES } from "snu-lib";

export function useCohortHasPDT(cohortName: string) {
  return useQuery({
    queryKey: ["hasPDT", cohortName],
    queryFn: async () => {
      const { ok, code, data } = await API.get(`/ligne-de-bus/cohort/${cohortName}/hasValue`);
      if (!ok) throw new Error(code);
      return data;
    },
  });
}

export function getInitialCohort(user, cohorts, sessionPhase1) {
  if (user.role === ROLES.HEAD_CENTER && sessionPhase1) {
    return sessionPhase1.cohort;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const cohortInURL = urlParams.get("cohort");
  const defaultCohort = cohorts?.[0]?.name;
  return cohortInURL || defaultCohort;
}
