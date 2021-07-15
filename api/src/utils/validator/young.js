const Joi = require("joi");
const { validateMission: validateMissionDefault, validateProgram: validateProgramDefault, youngKeys } = require("./default");

function validateMission(mission) {
  return validateMissionDefault(mission);
}

function validateProgram(program) {
  return validateProgramDefault(program);
}

function validateYoung(young) {
  return Joi.object().keys(youngKeys()).validate(young, { stripUnknown: true });
}

module.exports = {
  validateMission,
  validateProgram,
  validateYoung,
};
