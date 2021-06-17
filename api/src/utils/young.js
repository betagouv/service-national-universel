const Joi = require("joi");

function validateMission(mission) {
  return Joi.object()
    .keys({
      name: Joi.string().allow(null, ""),
      domains: Joi.array().items(Joi.string().allow(null, "")),
      startAt: Joi.string().allow(null, ""),
      endAt: Joi.string().allow(null, ""),
      format: Joi.string().allow(null, ""),
      frequence: Joi.string().allow(null, ""),
      period: Joi.array().items(Joi.string().allow(null, "")),
      subPeriod: Joi.array().items(Joi.string().allow(null, "")),
      placesTotal: Joi.number().allow(null),
      placesLeft: Joi.number().allow(null),
      actions: Joi.string().allow(null, ""),
      description: Joi.string().allow(null, ""),
      justifications: Joi.string().allow(null, ""),
      contraintes: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      status: Joi.string().allow(null, ""),
      tutorId: Joi.string().allow(null, ""),
      tutorName: Joi.string().allow(null, ""),
      address: Joi.string().allow(null, ""),
      zip: Joi.string().allow(null, ""),
      city: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      country: Joi.string().allow(null, ""),
      location: Joi.object().keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      }),
      remote: Joi.string().allow(null, ""),
    })
    .validate(mission, { stripUnknown: true });
}

module.exports = {
  validateMission,
};
