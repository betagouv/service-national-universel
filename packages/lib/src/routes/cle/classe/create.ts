import Joi from "joi";
import { CLE_COLORATION_LIST, CLE_FILIERE_LIST, CLE_GRADE_LIST, TYPE_CLASSE_LIST } from "src/constants/constants";
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

export const CreateClasseRouteSchema = {
  payload: Joi.object<CreateClasseRoute["payload"]>({
    // Classe
    name: Joi.string().required(),
    cohort: Joi.string().allow("").allow(null).optional(),
    estimatedSeats: Joi.number().min(1).required(),
    coloration: Joi.string()
      .valid(...CLE_COLORATION_LIST)
      .required(),
    filiere: Joi.string().valid(...CLE_FILIERE_LIST),
    grades: Joi.array().items(Joi.string().valid(...CLE_GRADE_LIST)),
    type: Joi.string()
      .valid(...TYPE_CLASSE_LIST)
      .required(),
    etablissementId: Joi.string().required(),
    // Referent
    referent: Joi.object({
      _id: Joi.string().optional(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().required(),
    }).required(),
  }),
};
