import Joi from "joi";
import { idSchema } from "../../utils/validator";

export const GetEtablissementsByIdsSchema = {
  payload: Joi.object({
    ids: Joi.array().items(idSchema()).min(1).required(),
  }),
};
