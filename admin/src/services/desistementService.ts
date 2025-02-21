import { DesistementRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const DesistementService = {
  getDesistementPreview: async (sessionId: string, affectationTaskId: string) => {
    return await buildRequest<DesistementRoutes["GetPreview"]>({
      path: "/desistement/{sessionId}/preview/{affectationTaskId}",
      method: "GET",
      params: { sessionId, affectationTaskId },
      target: "API_V2",
    })();
  },
  postDesistement: async ({ sessionId, taskId }: { sessionId: string; taskId: string }) => {
    console.log("🚀 ~ postDesistement: ~ taskId:", taskId);
    return await buildRequest<DesistementRoutes["Post"]>({
      path: "/desistement/{sessionId}",
      method: "POST",
      params: { sessionId },
      payload: { affectationTaskId: taskId },
      target: "API_V2",
    })();
  },
};

export { DesistementService };
