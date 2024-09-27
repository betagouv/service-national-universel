const { generateRandomEmail, generateBirthdate } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = ["_id.$oid", "zip", "mail", "birthdateAt", "createdAt.$date", "updatedAt.$date"];

  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.mail && (item.mail = generateRandomEmail());
  item.birthdateAt && (item.birthdateAt = generateBirthdate());

  return item;
}

module.exports = anonymize;
