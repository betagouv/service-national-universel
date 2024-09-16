import { ClasseType } from "../../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface DeleteClasseRoute extends BasicRoute {
  method: "DELETE";
  path: "/cle/classe/{id}";
  params: { id: string };
  query: {
    type: "delete" | "withdraw";
  };
  response: RouteResponseBody<ClasseType>;
}
