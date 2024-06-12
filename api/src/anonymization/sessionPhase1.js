const { starify } = require("../utils/anonymise");

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
  return item;
}

module.exports = anonymize;
