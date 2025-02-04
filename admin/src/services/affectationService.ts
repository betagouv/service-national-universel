import { AffectationRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const AffectationService = {
  getAffectation: async (sessionId: string, type: "HTS" | "CLE" | "CLE_DROMCOM") => {
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

  postSimulationAffectationCLEDromCom: async (sessionId: string, { departements, etranger }: AffectationRoutes["PostSimulationsCLEDromComRoute"]["payload"]) => {
    return await buildRequest<AffectationRoutes["PostSimulationsCLEDromComRoute"]>({
      path: "/affectation/{sessionId}/simulation/cle-dromcom",
      method: "POST",
      params: { sessionId },
      payload: { departements, etranger },
      target: "API_V2",
    })();
  },

  postValiderAffectationHtsMetropole: async (sessionId: string, simulationId: string, { affecterPDR }: AffectationRoutes["PostValiderAffectationHTSRoute"]["payload"]) => {
    return await buildRequest<AffectationRoutes["PostValiderAffectationHTSRoute"]>({
      path: "/affectation/{sessionId}/simulation/{simulationId}/valider/hts",
      method: "POST",
      params: { sessionId, simulationId },
      payload: { affecterPDR },
      target: "API_V2",
    })();
  },

  postValiderAffectationCleMetropole: async (sessionId: string, simulationId: string) => {
    return await buildRequest<AffectationRoutes["PostValiderAffectationCLERoute"]>({
      path: "/affectation/{sessionId}/simulation/{simulationId}/valider/cle",
      method: "POST",
      params: { sessionId, simulationId },
      target: "API_V2",
    })();
  },

  postValiderAffectationCleDromCom: async (sessionId: string, simulationId: string) => {
    return await buildRequest<AffectationRoutes["PostValiderAffectationCLEDromComRoute"]>({
      path: "/affectation/{sessionId}/simulation/{simulationId}/valider/cle-dromcom",
      method: "POST",
      params: { sessionId, simulationId },
      target: "API_V2",
    })();
  },
};

export { AffectationService };
