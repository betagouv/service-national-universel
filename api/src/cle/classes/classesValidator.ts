import Joi from "joi";
import { UpdateReferentClasse } from "../classe/classeService";

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
