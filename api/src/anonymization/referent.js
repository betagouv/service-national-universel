const { generateRandomName, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "firstName",
    "lastName",
    "email",
    "emailValidatedAt",
    "emailWaitingValidation",
    "password",
    "loginAttempts",
    "token2FA",
    "token2FAExpires",
    "attempts2FA",
    "acceptCGU",
    "lastLoginAt",
    "lastActivityAt",
    "lastLogoutAt",
    "passwordChangedAt",
    "registredAt",
    "nextLoginAttemptIn",
    "forgotPasswordResetToken",
    "forgotPasswordResetExpires",
    "invitationToken",
    "invitationExpires",
    "role",
    "subRole",
    "region",
    "department",
    "structureId",
    "sessionPhase1Id",
    "cohorts",
    "cohortIds",
    "cohesionCenterId",
    "cohesionCenterName",
    "phone",
    "mobile",
    "metadata",
    "metadata._id.$oid",
    "deletedAt",
    "createdAt",
    "updatedAt",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.phone && (item.phone = generateNewPhoneNumber());
  item.mobile && (item.mobile = generateNewPhoneNumber());
  item.email && (item.email = generateRandomEmail());
  item.firstName && (item.firstName = generateRandomName());
  item.lastName && (item.lastName = generateRandomName());

  item.invitationToken = "";
  item.forgotPasswordResetToken = "";
  item.token2FA = "";

  return item;
}

module.exports = anonymize;
