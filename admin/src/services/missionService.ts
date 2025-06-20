import { MissionRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const MissionService = {
  postCandidaturesExport: async ({ filters, fields, searchTerm }: MissionRoutes["PostCandidaturesExportRoute"]["payload"]) => {
    return await buildRequest<MissionRoutes["PostCandidaturesExportRoute"]>({
      path: "/mission/candidatures/export",
      method: "POST",
      payload: {
        filters: filters,
        fields: fields,
        searchTerm: searchTerm,
      },
      target: "API_V2",
    })();
  },
  postMissionsExport: async ({ filters, fields, searchTerm }: MissionRoutes["PostMissionsExportRoute"]["payload"]) => {
    return await buildRequest<MissionRoutes["PostMissionsExportRoute"]>({
      path: "/mission/export",
      method: "POST",
      payload: { filters, fields, searchTerm },
      target: "API_V2",
    })();
  },
};

export { MissionService };
