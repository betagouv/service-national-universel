const { generateAddress, generateRandomName, starify, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");
const { structureSchemaFields, anonymizeNewFields } = require("../utils/anonymise-model-fields");

function anonymize(item) {
  item.name && (item.name = generateRandomName().toUpperCase());
  item.siret && (item.siret = starify(item.siret));
  item.address && (item.address = generateAddress());
  item.website && (item.website = "https://www.google.com");
  item.description && (item.description = starify(item.description));
  item.twitter && (item.twitter = "www.twitter.com");
  item.facebook && (item.facebook = "www.facebook.com");
  item.instagram && (item.instagram = "www.instagram.com");
  //anonymize structure manager
  item.structureManager?.firstName && (item.structureManager.firstName = generateRandomName());
  item.structureManager?.lastName && (item.structureManager.lastName = generateRandomName());
  item.structureManager?.mobile && (item.structureManager.mobile = generateNewPhoneNumber());
  item.structureManager?.email && (item.structureManager.email = generateRandomEmail());

  const knownFields = [
    "name",
    "siret",
    "address",
    "website",
    "description",
    "twitter",
    "facebook",
    "instagram",
    "structureManager.firstName",
    "structureManager.lastName",
    "structureManager.mobile",
    "structureManager.email",
  ];

  return anonymizeNewFields(item, knownFields, structureSchemaFields);
}

module.exports = anonymize;
