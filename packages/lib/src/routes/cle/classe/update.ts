import { ClasseDto } from "src/dto";
import { BasicRoute, RouteResponseBody } from "src/routes";

export interface UpdateClasseRoute extends BasicRoute {
  method: "PUT";
  path: "/cle/classe/{id}";
  params: {
    id: string;
  };
  payload: Pick<
    ClasseDto,
    | "name"
    | "totalSeats"
    | "cohort"
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
  response: RouteResponseBody<ClasseDto>;
}
