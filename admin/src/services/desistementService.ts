import { DesistementRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const DesistementService = {
  postDesistement: async ({ sessionId, taskId }: { sessionId: string; taskId: string }) => {
    return await buildRequest<DesistementRoutes["Post"]>({
      path: "/desistement/{sessionId}",
      method: "POST",
      params: { sessionId },
      body: { affectationTaskId: taskId },
      target: "API_V2",
    })();
  },
};

export { DesistementService };
