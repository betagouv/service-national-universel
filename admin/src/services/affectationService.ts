import { AffectationRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const AffectationService = {
  getSimulationAnalytics: async (id: string) => {
    return await buildRequest<AffectationRoutes["GetSimulationAnalytics"]>({
      path: "/affectation/simulation/hts/{id}/analytics",
      method: "GET",
      params: { id },
      target: "API_V2",
    })();
  },
};

export { AffectationService };
