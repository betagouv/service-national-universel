import Joi from "joi";
import { idSchema } from "../utils/validator";

export const GetSessionPhase1ByIdsSchema = {
  payload: Joi.object({
    ids: Joi.array().items(idSchema()).min(1).required(),
  }),
};
