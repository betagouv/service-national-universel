const Joi = require("joi");
const { ROLES_LIST, SUB_ROLES_LIST } = require("snu-lib/roles");
const { youngKeys, validateMission: validateMissionDefault, validateProgram: validateProgramDefault, validateFirstName } = require("./default");

function validateMission(mission) {
  return validateMissionDefault(mission);
}

function validateProgram(program) {
  return validateProgramDefault(program);
}

function validateYoung(young) {
  return Joi.object().keys(youngKeys()).validate(young, { stripUnknown: true });
}

function validateDepartmentService(departmentService) {
  return Joi.object()
    .keys({
      department: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      directionName: Joi.string().allow(null, ""),
      serviceName: Joi.string().allow(null, ""),
      serviceNumber: Joi.string().allow(null, ""),
      address: Joi.string().allow(null, ""),
      complementAddress: Joi.string().allow(null, ""),
      zip: Joi.string().allow(null, ""),
      city: Joi.string().allow(null, ""),
      description: Joi.string().allow(null, ""),
    })
    .validate(departmentService, { stripUnknown: true });
}

function validateReferent(referent) {
  return Joi.object()
    .keys({
      firstName: validateFirstName().allow(null, ""),
      lastName: Joi.string().uppercase().allow(null, ""),
      email: Joi.string().lowercase().trim().email().allow(null, ""),
      password: Joi.string().allow(null, ""),
      forgotPasswordResetToken: Joi.string().allow(null, ""),
      invitationToken: Joi.string().allow(null, ""),
      role: Joi.string()
        .allow(null)
        .valid(...ROLES_LIST),
      region: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      subRole: Joi.string()
        .allow(null, "")
        .valid(...SUB_ROLES_LIST),
      cohesionCenterId: Joi.string().allow(null, ""),
      cohesionCenterName: Joi.string().allow(null, ""),
      phone: Joi.string().allow(null, ""),
      mobile: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
    })
    .validate(referent, { stripUnknown: true });
}

function validateSelf(referent) {
  // Referents can not update their role.
  return Joi.object()
    .keys({
      firstName: validateFirstName().allow(null, ""),
      lastName: Joi.string().uppercase().allow(null, ""),
      email: Joi.string().lowercase().trim().email().allow(null, ""),
      password: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      subRole: Joi.string()
        .allow(null, "")
        .valid(...SUB_ROLES_LIST),
      cohesionCenterId: Joi.string().allow(null, ""),
      cohesionCenterName: Joi.string().allow(null, ""),
      phone: Joi.string().allow(null, ""),
      mobile: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
    })
    .validate(referent, { stripUnknown: true });
}

module.exports = {
  validateMission,
  validateProgram,
  validateDepartmentService,
  validateYoung,
  validateReferent,
  validateSelf,
};
