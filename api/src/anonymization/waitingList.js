const { generateRandomEmail, generateBirthdate } = require("../utils/anonymise");
const { waitingListSchemaFields, anonymizeNewFields } = require("../utils/anonymise-model-fields");

function anonymize(item) {
  item.mail && (item.mail = generateRandomEmail());
  item.birthdateAt && (item.birthdateAt = generateBirthdate());

  const knownFields = ["mail", "birthdateAt"];

  return anonymizeNewFields(item, knownFields, waitingListSchemaFields);
}

module.exports = anonymize;
