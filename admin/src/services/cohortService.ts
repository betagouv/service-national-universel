import { CohortsRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const CohortService = {
  getEligibilityForYoung: async ({
    id,
    payload,
    query,
  }: {
    id?: CohortsRoutes["PostEligibility"]["params"]["id"];
    payload?: CohortsRoutes["PostEligibility"]["payload"];
    query?: CohortsRoutes["PostEligibility"]["query"];
  } = {}) => {
    const {
      ok,
      code,
      data: cohorts,
    } = await buildRequest<CohortsRoutes["PostEligibility"]>({
      path: "/cohort-session/eligibility/2023/{id?}",
      method: "POST",
      params: { id },
      payload,
      query,
    })();
    if (!ok) {
      throw new Error(code);
    }
    return cohorts;
  },
};

export { CohortService };
