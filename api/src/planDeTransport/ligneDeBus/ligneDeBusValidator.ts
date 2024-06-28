import Joi from "joi";
import { BusTeamUpdateDto } from "snu-lib/src/dto";

export const validateLigneDeBusTeam = (ligneBusDto: BusTeamUpdateDto): Joi.ValidationResult<BusTeamUpdateDto> => {
  return Joi.object<BusTeamUpdateDto, true, BusTeamUpdateDto>({
    role: Joi.string().required(),
    idTeam: Joi.string(),
    lastName: Joi.string().required(),
    firstName: Joi.string().required(),
    birthdate: Joi.date().required(),
    phone: Joi.string().required(),
    mail: Joi.string().required(),
    forth: Joi.boolean().required(),
    back: Joi.boolean().required(),
  }).validate(ligneBusDto, { stripUnknown: true });
};
