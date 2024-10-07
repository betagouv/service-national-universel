const { generateAddress, starify } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "isValid",
    "cohort",
    "cohortId",
    "busId",
    "busExcelId",
    "centerId",
    "centerCode",
    "departureAddress",
    "departureZip",
    "departureCity",
    "departureDepartment",
    "departureRegion",
    "hideDepartmentInConvocation",
    "departureAt.$date",
    "departureAtString",
    "realDepartureAtString",
    "returnAt.$date",
    "returnAtString",
    "realReturnAtString",
    "createdAt.$date",
    "updatedAt.$date",
    "deletedAt.$date",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.departureAddress && (item.departureAddress = generateAddress());
  item.centerCode && (item.centerCode = starify(item.centerCode));

  return item;
}

module.exports = anonymize;
