import { buildRequest } from "@/utils/buildRequest";
import { ReferentRoutes } from "snu-lib";

const ReferentService = {
  getByRole: async (query: ReferentRoutes["GetByRole"]["query"]) => {
    return await buildRequest<ReferentRoutes["GetByRole"]>({
      path: "/referent",
      method: "GET",
      query,
      target: "API_V2",
    })();
  },
};

export { ReferentService };
