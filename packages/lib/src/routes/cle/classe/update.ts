import { ClasseType } from "../../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface UpdateClasseRoute extends BasicRoute {
  method: "PUT";
  path: "/cle/classe/{id}";
  params: {
    id: string;
  };
  payload: Pick<
    ClasseType,
    | "name"
    | "totalSeats"
    | "cohortId"
    | "estimatedSeats"
    | "coloration"
    | "filiere"
    | "grades"
    | "type"
    | "etablissementId"
    | "sessionId"
    | "cohesionCenterId"
    | "pointDeRassemblementId"
  >;
  response: RouteResponseBody<ClasseType>;
}
