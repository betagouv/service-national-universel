import { ClasseType } from "../../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface GetManyClassesRoute extends BasicRoute {
  method: "POST";
  path: "/cle/classes";
  payload?: {
    ids: string[];
  };
  response: RouteResponseBody<ClasseType[]>;
}
