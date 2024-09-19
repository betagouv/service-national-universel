const { starify } = require("../utils/anonymise");
const { sessionPhase1SchemaFields, anonymizeNewFields } = require("../utils/anonymise-model-fields");

function anonymize(item) {
  item.zipCentre && (item.zipCentre = starify(item.zipCentre));
  item.codeCentre && (item.codeCentre = starify(item.codeCentre));
  item.nameCentre && (item.nameCentre = starify(item.nameCentre));
  item.cityCentre && (item.cityCentre = starify(item.cityCentre));
  if (!["VALIDATED", "WAITING_VALIDATION"].includes(item.status)) item.status = "WAITING_VALIDATION";
  item.team &&
    (item.team = item.team.map((member) => {
      member.firstName && (member.firstName = starify(member.firstName));
      member.lastName && (member.lastName = starify(member.lastName));
      member.email && (member.email = starify(member.email));
      member.phone && (member.phone = starify(member.phone));
      return member;
    }));

  const knownFields = ["zipCentre", "codeCentre", "nameCentre", "cityCentre", "status", "team.firstName", "team.lastName", "team.email", "team.phone"];

  return anonymizeNewFields(item, knownFields, sessionPhase1SchemaFields);
}

module.exports = anonymize;
