import Joi from "joi";
import { PreinscriptionRoutes } from "snu-lib";

const PostEligibilityRouteSchema = {
  body: Joi.object<PreinscriptionRoutes["PostEligibility"]["payload"]>({
    schoolDepartment: Joi.string().allow("", null),
    department: Joi.string(),
    region: Joi.string(),
    schoolRegion: Joi.string().allow("", null),
    birthdateAt: Joi.date().required(),
    grade: Joi.string(),
    status: Joi.string(),
    zip: Joi.string().allow("", null),
    isReInscription: Joi.boolean().required(),
  }),
};

export const PreinscriptionRoutesSchema = {
  PostEligibility: PostEligibilityRouteSchema,
};
