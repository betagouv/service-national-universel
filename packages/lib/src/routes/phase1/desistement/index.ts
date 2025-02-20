import { BasicRoute, DesistementTaskDto, RouteResponseBodyV2 } from "../../..";

interface PostDesistement extends BasicRoute {
  method: "POST";
  path: "/desistement/{sessionId}";
  params: { sessionId: string };
  payload: { affectationTaskId: string };
  response: RouteResponseBodyV2<DesistementTaskDto>;
}

export type DesistementRoutes = {
  Post: PostDesistement;
};
