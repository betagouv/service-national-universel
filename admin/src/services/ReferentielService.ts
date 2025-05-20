import { buildFileRequest, buildRequest } from "@/utils/buildRequest";
import { ReferentielRoutes, ReferentielTaskType } from "snu-lib";
import api from "./api";

const ReferentielService = {
  importFile: async (name: ReferentielTaskType, file: File) => {
    return await buildFileRequest<ReferentielRoutes["Import"]>({
      method: "POST",
      path: "/referentiel/import/{name}",
      params: {
        name,
      },
      file,
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

  importPDR: async (file: File) => {
    const res = await api.uploadFiles(`/point-de-rassemblement/import`, [file], {}, 0);
    if (!res.ok) {
      throw new Error(res.code + (res.message || ""));
    }
    return res.data;
  },
};

export { ReferentielService };
