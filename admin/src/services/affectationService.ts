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
};

export { AffectationService };
