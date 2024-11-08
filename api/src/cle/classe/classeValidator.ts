import Joi from "joi";

import { ClassesRoutes, CLE_COLORATION_LIST, CLE_FILIERE_LIST, CLE_GRADE_LIST, TYPE_CLASSE_LIST } from "snu-lib";

const GetOneClasseRouteSchema = {
  query: Joi.object<ClassesRoutes["GetOne"]["query"]>({
    withDetails: Joi.boolean().default(true),
  }),
};

const CreateClasseRouteSchema = {
  payload: Joi.object<ClassesRoutes["Create"]["payload"]>({
    // Classe
    name: Joi.string().required(),
    cohortId: Joi.string().allow("").allow(null).optional(),
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

const UpdateClasseRouteSchema = {
  payload: Joi.object<ClassesRoutes["Update"]["payload"]>({
    name: Joi.string().required(),
    estimatedSeats: Joi.number().required(),
    totalSeats: Joi.number().required(),
    cohortId: Joi.string().optional(),
    coloration: Joi.string()
      .valid(...CLE_COLORATION_LIST)
      .required(),
    filiere: Joi.string()
      .valid(...CLE_FILIERE_LIST)
      .required(),
    grades: Joi.array()
      .items(Joi.string().valid(...CLE_GRADE_LIST))
      .required(),
    type: Joi.string()
      .valid(...TYPE_CLASSE_LIST)
      .required(),
    sessionId: Joi.string().allow(null),
    cohesionCenterId: Joi.string().allow(null),
    pointDeRassemblementId: Joi.string().allow(null),
  }),
};

const DeleteClasseRouteSchema = {
  query: Joi.object<ClassesRoutes["Delete"]["query"]>({
    type: Joi.string().valid("delete", "withdraw").required(),
  }),
};

export const ClassesRoutesSchema = {
  GetOne: GetOneClasseRouteSchema,
  Create: CreateClasseRouteSchema,
  Update: UpdateClasseRouteSchema,
  Delete: DeleteClasseRouteSchema,
};
