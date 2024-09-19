const { generateRandomName, generateBirthdate, generateRandomEmail, generateNewPhoneNumber } = require("../../utils/anonymise");
const { ligneBusSchemaFields, anonymizeNewFields } = require("../../utils/anonymise-model-fields");

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

  const knownFields = ["team.lastName", "team.firstName", "team.birthdate", "team.mail", "team.phone"];

  return anonymizeNewFields(item, knownFields, ligneBusSchemaFields);
}

module.exports = anonymize;
