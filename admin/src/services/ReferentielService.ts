import { buildFileRequest, buildRequest } from "@/utils/buildRequest";
import { ReferentielRoutes } from "snu-lib";

const ReferentielService = {
  importFile: async (name: string, file: File) => {
    return await buildFileRequest<ReferentielRoutes["Import"]>({
      method: "POST",
      path: "/referentiel/import/{name}",
      params: {
        name,
      },
      payload: file,
      target: "API_V2",
    })();
  },

  getImports: async (query: ReferentielRoutes["GetImports"]["query"]) => {
    return await buildRequest<ReferentielRoutes["GetImports"]>({
      method: "GET",
      path: "/referentiel/import",
      query,
      target: "API_V2",
    })();
  },
};

export { ReferentielService };
