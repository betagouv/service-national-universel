import { JeuneRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const JeuneService = {
  postJeunesExport: async (payload: JeuneRoutes["PostJeunesExport"]["payload"]) => {
    return await buildRequest<JeuneRoutes["PostJeunesExport"]>({
      path: "/jeune/export",
      method: "POST",
      target: "API_V2",
      payload,
    })();
  },

  postJeunesScolariseExport: async (payload: JeuneRoutes["PostJeunesScolariseExport"]["payload"]) => {
    return await buildRequest<JeuneRoutes["PostJeunesScolariseExport"]>({
      path: "/jeune/export/scolarises",
      method: "POST",
      target: "API_V2",
      payload,
    })();
  },
};

export { JeuneService };
