const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "name",
    "code2022",
    "address",
    "city",
    "zip",
    "department",
    "region",
    "addressVerified",
    "placesTotal",
    "pmr",
    "cohorts",
    "cohortIds",
    "academy",
    "typology",
    "domain",
    "complement",
    "centerDesignation",
    "placesLeft",
    "outfitDelivered",
    "observations",
    "waitingList",
    "COR",
    "code",
    "country",
    "departmentCode",
    "sessionStatus",
    "createdAt.$date",
    "updatedAt.$date",
    "__v",
  ];

  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.code2022 && (item.code2022 = "02022");
  item.code && (item.code = "00000");

  return item;
}

module.exports = anonymize;
