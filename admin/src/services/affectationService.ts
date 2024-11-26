import { AffectationRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const AffectationService = {
  postAffectationMetropole: async (sessionId: string, { departements, niveauScolaires, changementDepartements }: AffectationRoutes["PostSimulationsRoute"]["payload"]) => {
    return await buildRequest<AffectationRoutes["PostSimulationsRoute"]>({
      path: "/affectation/{sessionId}/simulations",
      method: "POST",
      params: { sessionId },
      payload: { departements, niveauScolaires, changementDepartements },
      target: "API_V2",
    })();
  },
};

export { AffectationService };
