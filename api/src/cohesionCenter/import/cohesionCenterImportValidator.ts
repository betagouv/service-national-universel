import Joi from "joi";
import { CohesionCenterImportRoute } from "./cohesionCenterImport";

export const cohesionCenterImportBodySchema = Joi.object<CohesionCenterImportRoute>({
  centerFilePath: Joi.string().required(),
  sessionCenterFilePath: Joi.string().required(),
});
