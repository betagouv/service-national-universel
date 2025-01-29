import { BasicRoute, RouteResponseBodyV2, TaskStatus } from "../../..";

export interface GetAffectation extends BasicRoute {
  method: "GET";
  path: "/affectation/{sessionId}/{type}";
  params: { sessionId: string; type: "HTS" | "CLE" };
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
