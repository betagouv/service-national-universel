import { DesistementRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const DesistementService = {
  getDesistement: async (sessionId: string) => {
    return await buildRequest<DesistementRoutes["GetDesistement"]>({
      path: "/desistement/{sessionId}",
      method: "GET",
      params: { sessionId },
      target: "API_V2",
    })();
  },
  postSimulationDesistement: async ({ sessionId, taskId }: { sessionId: string; taskId: string }) => {
    return await buildRequest<DesistementRoutes["PostSimuler"]>({
      path: "/desistement/{sessionId}/simulation",
      method: "POST",
      params: { sessionId },
      payload: { affectationTaskId: taskId },
      target: "API_V2",
    })();
  },
  postValiderDesistement: async ({ sessionId, taskId }: { sessionId: string; taskId: string }) => {
    return await buildRequest<DesistementRoutes["PostValider"]>({
      path: "/desistement/{sessionId}/simulation/{taskId}/valider",
      method: "POST",
      params: { sessionId, taskId },
      target: "API_V2",
    })();
  },
};

export { DesistementService };
