import { InscriptionRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const InscriptionService = {
  postInscriptionsExport: async (payload: InscriptionRoutes["PostInscriptionsExport"]["payload"]) => {
    return await buildRequest<InscriptionRoutes["PostInscriptionsExport"]>({
      path: "/inscription/export",
      method: "POST",
      target: "API_V2",
      payload,
    })();
  },

  postInscriptionsScolariseExport: async (payload: InscriptionRoutes["PostInscriptionsScolariseExport"]["payload"]) => {
    return await buildRequest<InscriptionRoutes["PostInscriptionsScolariseExport"]>({
      path: "/inscription/export/scolarises",
      method: "POST",
      target: "API_V2",
      payload,
    })();
  },
};

export { InscriptionService };
