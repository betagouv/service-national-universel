import Joi from "joi";
import { ClasseDto } from "src/dto";
import { BasicRoute, RouteResponseBody } from "src/routes";

export interface GetClasseRoute extends BasicRoute {
  method: "GET";
  path: "/cle/classe/{id}";
  params: { id: string };
  query?: {
    withDetails?: boolean;
  };
  response: RouteResponseBody<ClasseDto>;
}

export const GetClasseRouteSchema = {
  query: Joi.object<GetClasseRoute["query"]>({
    withDetails: Joi.boolean().default(true),
  }),
};

export const getClasseRoute: Pick<GetClasseRoute, "method" | "path"> = {
  method: "GET",
  path: "/cle/classe/{id}",
};
// OU
export const buildGetClasseRoute = (id: string): Pick<GetClasseRoute, "method" | "path" | "params"> => ({
  method: "GET",
  path: "/cle/classe/{id}",
  params: { id },
});
