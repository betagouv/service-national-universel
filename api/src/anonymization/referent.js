const { generateRandomName, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "firstName",
    "lastName",
    "email",
    "emailValidatedAt.$date",
    "emailWaitingValidation",
    "password",
    "loginAttempts",
    "token2FA",
    "token2FAExpires.$date",
    "attempts2FA",
    "acceptCGU",
    "lastLoginAt.$date",
    "lastActivityAt.$date",
    "lastLogoutAt.$date",
    "passwordChangedAt.$date",
    "registredAt.$date",
    "nextLoginAttemptIn.$date",
    "forgotPasswordResetToken",
    "forgotPasswordResetExpires.$date",
    "invitationToken",
    "invitationExpires.$date",
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
    "metadata._id.$oid",
    "deletedAt.$date",
    "createdAt.$date",
    "updatedAt.$date",
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
