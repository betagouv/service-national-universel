import { InscriptionRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const InscriptionService = {
  getBasculeJeunesValides: async (sessionId: string) => {
    return await buildRequest<InscriptionRoutes["GetBasculeJeunesValides"]>({
      path: "/inscription/{sessionId}/bascule-jeunes-valides/status",
      method: "GET",
      params: { sessionId },
      target: "API_V2",
    })();
  },

  postBasculeJeunesValides: async (
    sessionId: string,
    { status, statusPhase1, cohesionStayPresence, statusPhase1Motif, niveauScolaires, departements, etranger, avenir }: InscriptionRoutes["PostBasculeJeunesValides"]["payload"],
  ) => {
    return await buildRequest<InscriptionRoutes["PostBasculeJeunesValides"]>({
      path: "/inscription/{sessionId}/bascule-jeunes-valides/simulation",
      method: "POST",
      params: { sessionId },
      payload: { status, statusPhase1, cohesionStayPresence, statusPhase1Motif, niveauScolaires, departements, etranger, avenir },
      target: "API_V2",
    })();
  },

  postValiderBasculeJeunesValides: async (sessionId: string, simulationId: string, payload: InscriptionRoutes["PostValiderBasculeJeunesValides"]["payload"]) => {
    return await buildRequest<InscriptionRoutes["PostValiderBasculeJeunesValides"]>({
      path: "/inscription/{sessionId}/simulation/{simulationId}/bascule-jeunes-valides/valider",
      method: "POST",
      params: { sessionId, simulationId },
      target: "API_V2",
      payload,
    })();
  },
};

export { InscriptionService };
