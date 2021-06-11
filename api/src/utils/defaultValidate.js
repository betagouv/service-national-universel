const Joi = require("joi");

function validateId(id) {
  return Joi.string().allow(null, "").validate(id, { stripUnknown: true });
}

module.exports = {
  validateId,
};
