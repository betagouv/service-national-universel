const { generateAddress, generateRandomName, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");
const { departmentServiceSchemaFields, anonymizeNewFields } = require("../utils/anonymise-model-fields");

function anonymize(item) {
  item.email && (item.email = generateRandomEmail());
  item.contactPhone && (item.contactPhone = generateNewPhoneNumber());
  item.address && (item.address = generateAddress());
  item.directionName && (item.directionName = generateRandomName());
  item.contactName && (item.contactName = generateRandomName());
  item.contactMail && (item.contactMail = generateRandomEmail());
  item.contacts &&
    (item.contacts = [
      {
        cohort: "New Cohort",
        contactName: "New Contact",
        contactPhone: generateNewPhoneNumber(),
        contactMail: generateRandomEmail(),
      },
    ]);
  item.representantEtat &&
    (item.representantEtat = {
      firstName: generateRandomName(),
      lastName: generateRandomName(),
      mobile: generateNewPhoneNumber(),
      email: generateRandomEmail(),
    });

  const knownFields = ["email", "contactPhone", "address", "directionName", "contactName", "contactMail", "contacts", "representantEtat"];

  return anonymizeNewFields(item, knownFields, departmentServiceSchemaFields);
}

module.exports = anonymize;
