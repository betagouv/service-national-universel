const { generateAddress, generateRandomName, starify, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "name",
    "siret",
    "description",
    "website",
    "facebook",
    "twitter",
    "instagram",
    "status",
    "isNetwork",
    "networkId",
    "networkName",
    "legalStatus",
    "types",
    "sousType",
    "associationTypes",
    "structurePubliqueType",
    "structurePubliqueEtatType",
    "structurePriveeType",
    "address",
    "zip",
    "city",
    "department",
    "region",
    "country",
    "location.lon",
    "location.lat",
    "addressVerified",
    "state",
    "isMilitaryPreparation",
    "isJvaStructure",
    "jvaStructureId",
    "jvaRawData",
    "structureManager.firstName",
    "structureManager.lastName",
    "structureManager.mobile",
    "structureManager.email",
    "structureManager.role",
    "createdAt.$date",
    "updatedAt.$date",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

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

  return item;
}

module.exports = anonymize;
