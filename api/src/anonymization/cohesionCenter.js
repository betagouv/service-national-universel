const { cohesionCenterSchemaFields, anonymizeNewFields } = require("../utils/anonymise-model-fields");

function anonymize(item) {
  item.code2022 && (item.code2022 = "02022");
  item.code && (item.code = "00000");

  const knownFields = ["code2022", "code"];

  return anonymizeNewFields(item, knownFields, cohesionCenterSchemaFields);
}

module.exports = anonymize;
