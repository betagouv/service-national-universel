import { InscriptionRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const InscriptionService = {
  getBasculerJeunesValides: async (sessionId: string) => {
    return await buildRequest<InscriptionRoutes["GetBasculerJeunesValides"]>({
      path: "/inscription/{sessionId}/bacule-jeunes-valides/status",
      method: "GET",
      params: { sessionId },
      target: "API_V2",
    })();
  },

  postBasculerJeunesValides: async (
    sessionId: string,
    { status, statusPhase1, cohesionStayPresence, statusPhase1Motif, niveauScolaires, departements, etranger, avenir }: InscriptionRoutes["PostBasculerJeunesValides"]["payload"],
  ) => {
    return await buildRequest<InscriptionRoutes["PostBasculerJeunesValides"]>({
      path: "/inscription/{sessionId}/bacule-jeunes-valides/simulation",
      method: "POST",
      params: { sessionId },
      payload: { status, statusPhase1, cohesionStayPresence, statusPhase1Motif, niveauScolaires, departements, etranger, avenir },
      target: "API_V2",
    })();
  },

  postValiderBasculerJeunesValides: async (sessionId: string, simulationId: string) => {
    return await buildRequest<InscriptionRoutes["PostValiderBasculerJeunesValides"]>({
      path: "/inscription/{sessionId}/simulation/{simulationId}/bacule-jeunes-valides/valider",
      method: "POST",
      params: { sessionId, simulationId },
      target: "API_V2",
    })();
  },
};

export { InscriptionService };
