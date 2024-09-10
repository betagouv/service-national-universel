import { ClasseDto } from "src/dto";
import { BasicRoute, RouteResponseBody } from "src/routes";

export interface DeleteClasseRoute extends BasicRoute {
  method: "DELETE";
  path: "/cle/classe/{id}";
  params: { id: string };
  query: {
    type: "delete" | "withdraw";
  };
  response: RouteResponseBody<ClasseDto>;
}
