import { AffectationRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const AffectationService = {
  postAffectationMetropole: async (
    sessionId: string,
    { niveauScolaires, departements, etranger, affecterPDR, sdrImportId }: AffectationRoutes["PostSimulationsRoute"]["payload"],
  ) => {
    return await buildRequest<AffectationRoutes["PostSimulationsRoute"]>({
      path: "/affectation/{sessionId}/simulations",
      method: "POST",
      params: { sessionId },
      payload: { niveauScolaires, departements, etranger, affecterPDR, sdrImportId },
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
