import { AffectationRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const AffectationService = {
  getAffectation: async (sessionId: string, type: "HTS" | "CLE") => {
    return await buildRequest<AffectationRoutes["GetAffectation"]>({
      path: "/affectation/{sessionId}/{type}",
      method: "GET",
      params: { sessionId, type },
      target: "API_V2",
    })();
  },

  postSimulationAffectationHTSMetropole: async (
    sessionId: string,
    { niveauScolaires, departements, etranger, affecterPDR, sdrImportId }: AffectationRoutes["PostSimulationsHTSRoute"]["payload"],
  ) => {
    return await buildRequest<AffectationRoutes["PostSimulationsHTSRoute"]>({
      path: "/affectation/{sessionId}/simulation/hts",
      method: "POST",
      params: { sessionId },
      payload: { niveauScolaires, departements, etranger, affecterPDR, sdrImportId },
      target: "API_V2",
    })();
  },

  postSimulationAffectationCLEMetropole: async (sessionId: string, { departements, etranger }: AffectationRoutes["PostSimulationsCLERoute"]["payload"]) => {
    return await buildRequest<AffectationRoutes["PostSimulationsCLERoute"]>({
      path: "/affectation/{sessionId}/simulation/cle",
      method: "POST",
      params: { sessionId },
      payload: { departements, etranger },
      target: "API_V2",
    })();
  },

  postValiderAffectation: async (sessionId: string, simulationId: string, { affecterPDR }: AffectationRoutes["PostValiderAffectationRoute"]["payload"]) => {
    return await buildRequest<AffectationRoutes["PostValiderAffectationRoute"]>({
      path: "/affectation/{sessionId}/simulation/{simulationId}/valider",
      method: "POST",
      params: { sessionId, simulationId },
      payload: { affecterPDR },
      target: "API_V2",
    })();
  },
};

export { AffectationService };
