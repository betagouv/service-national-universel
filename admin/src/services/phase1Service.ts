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
  getTraitements: async (sessionId: string, query: Phase1Routes["GetTraitementsRoute"]["query"]) => {
    return await buildRequest<Phase1Routes["GetTraitementsRoute"]>({
      path: "/phase1/{sessionId}/traitements",
      method: "GET",
      params: { sessionId },
      query,
      target: "API_V2",
    })();
  },
  deletePlanDeTransport: async (sessionId: string) => {
    return await buildRequest<Phase1Routes["DeletePDT"]>({
      path: "/phase1/{sessionId}/plan-de-transport",
      method: "DELETE",
      params: { sessionId },
      target: "API_V2",
    })();
  },
  changeSession: async (
    youngId: Phase1Routes["ChangeYoungSessionRoute"]["params"]["youngId"],
    ChangerLaCohorteDuJeunePayloadDto: Phase1Routes["ChangeYoungSessionRoute"]["payload"],
  ) => {
    return await buildRequest<Phase1Routes["ChangeYoungSessionRoute"]>({
      path: "/phase1/{youngId}/change-session",
      method: "PUT",
      params: { youngId },
      payload: ChangerLaCohorteDuJeunePayloadDto,
      target: "API_V2",
    })();
  },
};

export { Phase1Service };
