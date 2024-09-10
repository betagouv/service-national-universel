import { ReferentDto } from "../../../dto";
import { ClasseType } from "../../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface CreateClasseRoute extends BasicRoute {
  method: "POST";
  path: "/cle/classe";
  payload: Pick<ClasseType, "name" | "cohort" | "estimatedSeats" | "coloration" | "filiere" | "grades" | "type" | "etablissementId"> & {
    referent: Pick<ReferentDto, "_id" | "firstName" | "lastName" | "email">;
  };
  response: RouteResponseBody<ClasseType>;
}
