import { BasicRoute, RouteResponseBodyV2, TaskStatus } from "../../..";

export interface GetAffectation extends BasicRoute {
  method: "GET";
  path: "/affectation/{sessionId}/{type}";
  params: { sessionId: string; type: "HTS" | "HTS_DROMCOM" | "CLE" | "CLE_DROMCOM" };
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
