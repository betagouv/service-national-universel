import { ClasseType } from "../../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface GetOneClasseRoute extends BasicRoute {
  method: "GET";
  path: "/cle/classe/{id}";
  params: { id: string };
  query?: {
    withDetails?: boolean;
  };
  response: RouteResponseBody<ClasseType>;
}
