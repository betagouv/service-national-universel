import { AffectationRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const AffectationService = {
  getAffectation: async (sessionId: string, type: "HTS" | "HTS_DROMCOM" | "CLE" | "CLE_DROMCOM") => {
    return await buildRequest<AffectationRoutes["GetAffectation"]>({
      path: "/affectation/{sessionId}/{type}",
      method: "GET",
      params: { sessionId, type },
      target: "API_V2",
    })();
  },

  getSimulationAnalytics: async (id: string) => {
    return await buildRequest<AffectationRoutes["GetSimulationAnalytics"]>({
      path: "/affectation/simulation/hts/{id}/analytics",
      method: "GET",
      params: { id },
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

  postSimulationAffectationHTSDromCom: async (sessionId: string, { niveauScolaires, departements, etranger }: AffectationRoutes["PostSimulationsHTSDromComRoute"]["payload"]) => {
    return await buildRequest<AffectationRoutes["PostSimulationsHTSDromComRoute"]>({
      path: "/affectation/{sessionId}/simulation/hts-dromcom",
      method: "POST",
      params: { sessionId },
      payload: { niveauScolaires, departements, etranger },
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
  postValiderAffectationHtsDromCom: async (sessionId: string, simulationId: string) => {
    return await buildRequest<AffectationRoutes["PostValiderAffectationHTSDromComRoute"]>({
      path: "/affectation/{sessionId}/simulation/{simulationId}/valider/hts-dromcom",
      method: "POST",
      params: { sessionId, simulationId },
      target: "API_V2",
    })();
  },
  postSyncPlacesLigneDeBus: async (sessionId: string) => {
    return await buildRequest<AffectationRoutes["PostSyncPlacesLignesDeBus"]>({
      path: "/affectation/{sessionId}/ligne-de-bus/sync-places",
      method: "POST",
      params: { sessionId },
      target: "API_V2",
    })();
  },
  postSyncPlacesCentres: async (sessionId: string) => {
    return await buildRequest<AffectationRoutes["PostSyncPlacesCentres"]>({
      path: "/affectation/{sessionId}/centre/sync-places",
      method: "POST",
      params: { sessionId },
      target: "API_V2",
    })();
  },
  postSyncPlacesCentre: async (sessionId: string, centreId: string) => {
    return await buildRequest<AffectationRoutes["PostSyncPlacesCentre"]>({
      path: "/affectation/{sessionId}/centre/{centreId}/sync-places",
      method: "POST",
      params: { sessionId, centreId },
      target: "API_V2",
    })();
  },
};

export { AffectationService };
