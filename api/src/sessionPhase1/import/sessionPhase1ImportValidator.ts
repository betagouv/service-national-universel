import Joi from "joi";
import { SessionCenterImportRoute } from "./sessionPhase1Import";

export const sessionCohesionCenterImportBodySchema = Joi.object<SessionCenterImportRoute>({
  sessionCenterFilePath: Joi.string().required(),
});
