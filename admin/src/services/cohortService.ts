import { CohortsRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const CohortService = {
  getEligibility: async (
    id: CohortsRoutes["GetEligibility"]["params"]["id"],
    {
      payload,
      query,
    }: {
      payload: CohortsRoutes["GetEligibility"]["payload"];
      query: CohortsRoutes["GetEligibility"]["query"];
    },
  ) => {
    const {
      ok,
      code,
      data: cohorts,
    } = await buildRequest<CohortsRoutes["GetEligibility"]>({
      path: "/cohort-session/eligibility/2023/{id}",
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
