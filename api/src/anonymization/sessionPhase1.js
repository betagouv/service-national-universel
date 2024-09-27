const { starify } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "cohesionCenterId",
    "cohort",
    "cohortId",
    "department",
    "region",
    "codeCentre",
    "nameCentre",
    "zipCentre",
    "cityCentre",
    "headCenterId",
    "team.firstName",
    "team.lastName",
    "team.role",
    "team.email",
    "team.phone",
    "waitingList",
    "placesTotal",
    "placesLeft",
    "timeScheduleFiles._id",
    "timeScheduleFiles.name",
    "timeScheduleFiles.uploadedAt",
    "timeScheduleFiles.size",
    "timeScheduleFiles.mimetype",
    "hasTimeSchedule",
    "pedagoProjectFiles._id",
    "pedagoProjectFiles.name",
    "pedagoProjectFiles.uploadedAt",
    "pedagoProjectFiles.size",
    "pedagoProjectFiles.mimetype",
    "hasPedagoProject",
    "dateStart.$date",
    "dateEnd.$date",
    "status",
    "sanitaryContactEmail",
    "createdAt.$date",
    "updatedAt.$date",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

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
