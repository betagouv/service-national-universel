import Joi from "joi";
import { UpdateReferentClasse } from "../classe/classeService";
import { idSchema } from "../../utils/validator";

export const updateReferentsClassesSchema = Joi.array<(UpdateReferentClasse & { classeId: string })[]>()
  .items(
    Joi.object({
      classeId: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required().trim(),
    }),
  )
  .min(1);

export const GetClassesByIdsSchema = {
  payload: Joi.object({
    ids: Joi.array().items(idSchema()).min(1).required(),
  }),
};
