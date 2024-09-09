import { ClasseDto } from "src/dto";
import { BasicRoute, RouteResponseBody } from "src/routes";

export interface GetOneClasseRoute extends BasicRoute {
  method: "GET";
  path: "/cle/classe/{id}";
  params: { id: string };
  query?: {
    withDetails?: boolean;
  };
  response: RouteResponseBody<ClasseDto>;
}

export const getClasseRoute: Pick<GetOneClasseRoute, "method" | "path"> = {
  method: "GET",
  path: "/cle/classe/{id}",
};
// OU
export const buildGetClasseRoute = (id: string): Pick<GetOneClasseRoute, "method" | "path" | "params"> => ({
  method: "GET",
  path: "/cle/classe/{id}",
  params: { id },
});
