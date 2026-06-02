const { starify } = require("./utils/anonymise");
const { anonymizeNonDeclaredFields } = require("./utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "apiEngagementId",
    "youngId",
    "youngFirstName",
    "youngLastName",
    "youngEmail",
    "youngBirthdateAt",
    "youngCity",
    "youngDepartment",
    "youngCohort",
    "cohortId",
    "missionId",
    "isJvaMission",
    "missionName",
    "missionDepartment",
    "missionRegion",
    "missionDuration",
    "structureId",
    "tutorId",
    "contractId",
    "contractStatus",
    "tutorName",
    "priority",
    "hidden",
    "status",
    "statusComment",
    "contractAvenantFiles",
    "justificatifsFiles",
    "feedBackExperienceFiles",
    "othersFiles",
    "filesType",
    "createdAt",
    "updatedAt",
    "__v",
  ];

  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.youngEmail && (item.youngEmail = "*****@*******.***");
  item.youngFirstName && (item.youngFirstName = starify(item.youngFirstName));
  item.youngLastName && (item.youngLastName = starify(item.youngLastName));
  item.youngBirthdateAt && (item.youngBirthdateAt = starify(item.youngBirthdateAt));
  item.tutorName && (item.tutorName = starify(item.tutorName));
  item.missionName && (item.missionName = starify(item.missionName));
  item.contractStatus && (item.contractStatus = item.contractStatus || "DRAFT");

  item.contractAvenantFiles && (item.contractAvenantFiles = []);
  item.justificatifsFiles && (item.justificatifsFiles = []);
  item.feedBackExperienceFiles && (item.feedBackExperienceFiles = []);
  item.othersFiles && (item.othersFiles = []);

  // On rompt le lien vers le jeune : depuis sa fiche supprimée, on ne doit plus
  // pouvoir lister ses candidatures / missions.
  item.youngId = undefined;

  return item;
}

module.exports = anonymize;
