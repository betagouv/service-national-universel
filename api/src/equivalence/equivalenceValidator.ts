import Joi from "joi";
import { ENGAGEMENT_LYCEEN_TYPES, ENGAGEMENT_TYPES, EQUIVALENCE_STATUS, UNSS_TYPE } from "snu-lib";

export const createEquivalenceValidator = Joi.object({
  id: Joi.string().required(),
  type: Joi.string()
    .trim()
    .valid(...ENGAGEMENT_TYPES)
    .required(),
  sousType: Joi.string()
    .trim()
    .valid(...UNSS_TYPE, ...ENGAGEMENT_LYCEEN_TYPES),
  desc: Joi.string().trim().when("type", { is: "Autre", then: Joi.required() }),
  structureName: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  zip: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  startDate: Joi.string().trim().required(),
  endDate: Joi.string().trim().required(),
  missionDuration: Joi.number().allow(null),
  contactFullName: Joi.string().trim().required(),
  contactEmail: Joi.string().trim().required(),
  files: Joi.array().items(Joi.string().required()).required().min(1),
});

export const updateEquivalenceValidator = Joi.object({
  id: Joi.string().required(),
  idEquivalence: Joi.string().required(),
  status: Joi.string().valid(EQUIVALENCE_STATUS.WAITING_VERIFICATION, EQUIVALENCE_STATUS.WAITING_CORRECTION, EQUIVALENCE_STATUS.VALIDATED, EQUIVALENCE_STATUS.REFUSED),
  type: Joi.string()
    .trim()
    .valid(...ENGAGEMENT_TYPES),
  sousType: Joi.string()
    .trim()
    .valid(...UNSS_TYPE, ...ENGAGEMENT_LYCEEN_TYPES),
  desc: Joi.string().trim(),
  structureName: Joi.string().trim(),
  address: Joi.string().trim(),
  zip: Joi.string().trim(),
  city: Joi.string().trim(),
  startDate: Joi.string().trim(),
  endDate: Joi.string().trim(),
  contactFullName: Joi.string().trim(),
  missionDuration: Joi.number().allow(null),
  contactEmail: Joi.string().trim(),
  files: Joi.array().items(Joi.string()),
  message: Joi.string().trim(),
});
