const { generateAddress, starify } = require("../utils/anonymise");
const { meetingPointSchemaFields, anonymizeNewFields } = require("../utils/anonymise-model-fields");

function anonymize(item) {
  item.departureAddress && (item.departureAddress = generateAddress());
  item.centerCode && (item.centerCode = starify(item.centerCode));

  const knownFields = ["departureAddress", "centerCode"];

  return anonymizeNewFields(item, knownFields, meetingPointSchemaFields);
}

module.exports = anonymize;
