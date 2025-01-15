import { CohortGroupType } from "../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "..";

interface PostCohortGroupRoute extends BasicRoute {
  method: "POST";
  path: "/cohort-group";
  payload: { name: string; type: string; year: number };
  response: RouteResponseBody<CohortGroupType>;
}

interface GetCohortGroupRoute extends BasicRoute {
  method: "GET";
  path: "/cohort-group";
  response: RouteResponseBody<CohortGroupType[]>;
}

interface GetOpenCohortGroupRoute extends BasicRoute {
  method: "GET";
  path: "/cohort-group/open";
  response: RouteResponseBody<CohortGroupType[]>;
}

interface PutCohortGroupRoute extends BasicRoute {
  method: "PUT";
  path: "/cohort-group/:id";
  params: { id: string };
  payload: { name: string; type: string; year: number };
  response: RouteResponseBody<CohortGroupType>;
}

interface DeleteCohortGroupRoute extends BasicRoute {
  method: "DELETE";
  path: "/cohort-group/:id";
  params: { id: string };
  response: RouteResponseBody<boolean>;
}

export type CohortGroupRoutes = {
  Get: GetCohortGroupRoute;
  GetOpen: GetOpenCohortGroupRoute;
  Post: PostCohortGroupRoute;
  Put: PutCohortGroupRoute;
  Delete: DeleteCohortGroupRoute;
};
