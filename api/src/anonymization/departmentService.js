const { generateAddress, generateRandomName, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "contacts.cohort",
    "contacts.cohortId",
    "contacts.contactName",
    "contacts.contactPhone",
    "contacts.contactMail",
    "department",
    "region",
    "directionName",
    "serviceName",
    "serviceNumber",
    "address",
    "complementAddress",
    "zip",
    "city",
    "description",
    "contactName",
    "contactPhone",
    "contactMail",
    "representantEtat.firstName",
    "representantEtat.lastName",
    "representantEtat.mobile",
    "representantEtat.email",
    "representantEtat.role",
    "createdAt.$date",
    "updatedAt.$date",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

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

  return item;
}

module.exports = anonymize;
