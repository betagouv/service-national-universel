import { Phase1Routes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const Phase1Service = {
  getSimulations: async (sessionId: string, query: Phase1Routes["GetSimulationsRoute"]["query"]) => {
    return await buildRequest<Phase1Routes["GetSimulationsRoute"]>({
      path: "/phase1/{sessionId}/simulations",
      method: "GET",
      params: { sessionId },
      query,
      target: "API_V2",
    })();
  },
};

export { Phase1Service };
