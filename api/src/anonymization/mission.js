const { generateAddress, generateRandomName, starify } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "name",
    "domains",
    "mainDomain",
    "startAt.$date",
    "endAt.$date",
    "duration",
    "format",
    "frequence",
    "period",
    "subPeriod",
    "placesTotal",
    "placesLeft",
    "pendingApplications",
    "actions",
    "description",
    "justifications",
    "contraintes",
    "structureId",
    "structureName",
    "status",
    "visibility",
    "statusComment",
    "hebergement",
    "hebergementPayant",
    "tutorId",
    "tutorName",
    "address",
    "zip",
    "city",
    "department",
    "region",
    "country",
    "location.lat",
    "location.lon",
    "addressVerified",
    "remote",
    "isMilitaryPreparation",
    "createdAt.$date",
    "updatedAt.$date",
    "lastSyncAt.$date",
    "isJvaMission",
    "jvaMissionId",
    "apiEngagementId",
    "jvaRawData",
    "applicationStatus",
    "placesStatus",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.name && (item.name = `Mission ${generateRandomName()}`);
  item.description && (item.description = starify(item.description));
  item.address && (item.address = generateAddress());
  item.actions && (item.actions = "action Test");
  item.structureName && (item.structureName = starify(item.structureName));
  item.tutorName && (item.tutorName = starify(item.tutorName));
  item.actions && (item.actions = starify(item.actions));
  item.justifications && (item.justifications = starify(item.justifications));
  item.contraintes && (item.contraintes = starify(item.contraintes));
  item.frequence && (item.frequence = starify(item.frequence));
  item.jvaRawData && (item.jvaRawData = undefined);

  return item;
}

module.exports = anonymize;
