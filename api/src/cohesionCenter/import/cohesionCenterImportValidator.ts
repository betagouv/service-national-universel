import Joi from "joi";
import { CohesionCenterImportRoute } from "./cohesionCenterImport";

export const cohesionCenterImportBodySchema = Joi.object<CohesionCenterImportRoute>({
  cohesionCenterFilePath: Joi.string().required(),
});
