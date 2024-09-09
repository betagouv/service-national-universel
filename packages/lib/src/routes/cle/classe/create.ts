import { ClasseDto, ReferentDto } from "src/dto";
import { BasicRoute, RouteResponseBody } from "src/routes";

export interface CreateClasseRoute extends BasicRoute {
  method: "POST";
  path: "/cle/classe";
  payload: Pick<ClasseDto, "name" | "cohort" | "estimatedSeats" | "coloration" | "filiere" | "grades" | "type" | "etablissementId"> & {
    referent: Pick<ReferentDto, "_id" | "firstName" | "lastName" | "email">;
  };
  response: RouteResponseBody<ClasseDto>;
}
