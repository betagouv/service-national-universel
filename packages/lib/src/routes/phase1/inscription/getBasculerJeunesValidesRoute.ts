import { BasicRoute, RouteResponseBodyV2, TaskStatus } from "../../..";

export interface GetBasculerJeunesValidesRoute extends BasicRoute {
  method: "GET";
  path: "/inscription/{sessionId}/bacule-jeunes-valides/status";
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
