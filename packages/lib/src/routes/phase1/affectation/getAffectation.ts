import { BasicRoute, RouteResponseBodyV2, TaskStatus } from "../../..";

export interface GetAffectation extends BasicRoute {
  method: "GET";
  path: "/affectation/{sessionId}";
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
