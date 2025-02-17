import { BasicRoute, DesistementTaskDto, RouteResponseBodyV2, TaskStatus } from "../../..";

interface PostDesistement extends BasicRoute {
  method: "POST";
  path: "/desistement/{sessionId}";
  params: { sessionId: string };
  body: { affectationTaskId: string };
  response: RouteResponseBodyV2<DesistementTaskDto>;
}

export type DesistementRoutes = {
  Post: PostDesistement;
};
