import { buildRequest } from "@/utils/buildRequest";
import { id } from "date-fns/locale";
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

  mapReferentToView(referent) {
    return {
      _id: referent.id,
      firstName: referent.prenom,
      lastName: referent.nom,
      email: referent.email,
    };
  },
};

export { ReferentService };
