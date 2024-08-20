const { generateRandomEmail, generateBirthdate } = require("../utils/anonymise");

function anonymize(item) {
  item.mail && (item.mail = generateRandomEmail());
  item.birthdateAt && (item.birthdateAt = generateBirthdate());
  return item;
}

module.exports = anonymize;
