import { ClasseDto } from "src/dto";
import { BasicRoute, RouteResponseBody } from "src/routes";

export interface GetClasseRoute extends BasicRoute {
  method: "GET";
  path: "/cle/classe/{id}";
  params: { id: string };
  query?: {
    withDetails?: number;
  };
  response: RouteResponseBody<ClasseDto>;
}
