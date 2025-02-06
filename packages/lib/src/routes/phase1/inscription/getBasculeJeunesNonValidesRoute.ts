import { BasicRoute, RouteResponseBodyV2, TaskStatus } from "../../..";

export interface GetBasculeJeunesNonValidesRoute extends BasicRoute {
  method: "GET";
  path: "/inscription/{sessionId}/bascule-jeunes-non-valides/status";
  params: { sessionId: string };
  response: RouteResponseBodyV2<{
    simulation: {
      status: TaskStatus | "NONE";
    };
    traitement: {
      status: TaskStatus | "NONE";
      lastCompletedAt: string;
    };
  }>;
}
