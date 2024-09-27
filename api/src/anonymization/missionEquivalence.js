const { generateRandomName, generateRandomEmail, generateAddress, starify } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "youngId",
    "status",
    "type",
    "desc",
    "sousType",
    "structureName",
    "address",
    "zip",
    "city",
    "startDate.$date",
    "endDate.$date",
    "frequency.nombre",
    "frequency.duree",
    "frequency.frequence",
    "missionDuration",
    "contactFullName",
    "contactEmail",
    "files",
    "message",
    "createdAt.$date",
    "updatedAt.$date",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.message && (item.message = starify(item.message));
  item.address && (item.address = generateAddress());
  item.contactEmail && (item.contactEmail = generateRandomEmail());
  item.contactFullName && (item.contactFullName = generateRandomName() + generateRandomName());
  item.structureName && (item.structureName = generateRandomName());
  item.files && (item.files = []);

  return item;
}

module.exports = anonymize;
