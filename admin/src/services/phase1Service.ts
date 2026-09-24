import { Phase1Routes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

import API from "./api";

const Phase1Service = {
  getSimulation: async (id: string) => {
    return await buildRequest<Phase1Routes["GetSimulationRoute"]>({
      path: "/phase1/simulations/{id}",
      method: "GET",
      params: { id },
      target: "API_V2",
    })();
  },
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
  getLigneBusStats: async (
    ligneDeBusId: string,
  ): Promise<{
    meetingPoints: [
      {
        youngsCount: number;
        meetingPointId: string;
      },
    ];
    youngsCountBus: number;
    busVolume: number;
  }> => {
    const { ok, code, data } = await API.get(`/ligne-de-bus/${ligneDeBusId}/data-for-check`);
    if (!ok) throw new Error(code);
    return data;
  },
};

export { Phase1Service };
