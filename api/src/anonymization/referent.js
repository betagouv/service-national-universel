const { generateRandomName, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");
const { referenteSchemaFields, anonymizeNewFields } = require("../utils/anonymise-model-fields");

function anonymize(item) {
  item.phone && (item.phone = generateNewPhoneNumber());
  item.mobile && (item.mobile = generateNewPhoneNumber());
  item.email && (item.email = generateRandomEmail());
  item.firstName && (item.firstName = generateRandomName());
  item.lastName && (item.lastName = generateRandomName());

  item.invitationToken = "";
  item.forgotPasswordResetToken = "";
  item.token2FA = "";

  const knownFields = ["phone", "mobile", "email", "firstName", "lastName", "invitationToken", "forgotPasswordResetToken", "token2FA"];

  return anonymizeNewFields(item, knownFields, referenteSchemaFields);
}

module.exports = anonymize;
