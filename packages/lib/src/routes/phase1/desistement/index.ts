import { BasicRoute, DesistementSimulationTaskDto, DesistementValiderTaskDto, RouteResponseBodyV2, TaskStatus } from "../../..";

interface PostSimulerDesistementRoute extends BasicRoute {
  method: "POST";
  path: "/desistement/{sessionId}/simulation";
  params: { sessionId: string };
  payload: { affectationTaskId: string };
  response: RouteResponseBodyV2<DesistementSimulationTaskDto>;
}

interface PostValiderDesistementRoute extends BasicRoute {
  method: "POST";
  path: "/desistement/{sessionId}/valider";
  params: { sessionId: string };
  payload: { affectationTaskId: string };
  response: RouteResponseBodyV2<DesistementValiderTaskDto>;
}

export interface GetDesistementRoute extends BasicRoute {
  method: "GET";
  path: "/desistement/{sessionId}";
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

export type DesistementRoutes = {
  GetDesistement: GetDesistementRoute;
  PostSimuler: PostSimulerDesistementRoute;
  PostValider: PostValiderDesistementRoute;
};
