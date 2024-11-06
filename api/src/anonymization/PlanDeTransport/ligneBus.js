const { generateRandomName, generateBirthdate, generateRandomEmail, generateNewPhoneNumber } = require("../../utils/anonymise");

function anonymize(item) {
  item.team &&
    (item.team = item.team.map((t) => {
      t.lastName && (t.lastName = generateRandomName());
      t.firstName && (t.firstName = generateRandomName());
      t.birthdate && (t.birthdate = generateBirthdate());
      t.mail && (t.mail = generateRandomEmail());
      t.phone && (t.phone = generateNewPhoneNumber());
      return t;
    }));
  return item;
}

module.exports = anonymize;
