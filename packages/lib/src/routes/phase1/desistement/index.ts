import { BasicRoute, DesistementTaskDto, PreviewDesisterTaskResult, RouteResponseBodyV2 } from "../../..";

interface PostDesistement extends BasicRoute {
  method: "POST";
  path: "/desistement/{sessionId}";
  params: { sessionId: string };
  payload: { affectationTaskId: string };
  response: RouteResponseBodyV2<DesistementTaskDto>;
}

interface GetPreview extends BasicRoute {
  method: "GET";
  path: "/desistement/{sessionId}/preview/{affectationTaskId}";
  params: { sessionId: string; affectationTaskId: string };
  response: RouteResponseBodyV2<PreviewDesisterTaskResult>;
}

export type DesistementRoutes = {
  Post: PostDesistement;
  GetPreview: GetPreview;
};
