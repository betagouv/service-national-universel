import Joi from "joi";
import { ImportSessionCohesionCenterRoute } from "./sessionPhase1Import";

export const cohesionCenterImportBodySchema = Joi.object<ImportSessionCohesionCenterRoute>({
  sessionCohesionCenterFilePath: Joi.string().required(),
});
