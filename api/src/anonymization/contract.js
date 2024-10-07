const { generateBirthdate, generateNewPhoneNumber, starify, STAR_EMAIL } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "youngId",
    "structureId",
    "applicationId",
    "missionId",
    "tutorId",
    "isYoungAdult",
    "parent1Token",
    "projectManagerToken",
    "structureManagerToken",
    "parent2Token",
    "youngContractToken",
    "parent1Status",
    "projectManagerStatus",
    "structureManagerStatus",
    "parent2Status",
    "youngContractStatus",
    "parent1ValidationDate.$date",
    "projectManagerValidationDate.$date",
    "structureManagerValidationDate.$date",
    "parent2ValidationDate.$date",
    "youngContractValidationDate",
    "invitationSent",
    "youngFirstName",
    "youngLastName",
    "youngBirthdate",
    "youngAddress",
    "youngCity",
    "youngDepartment",
    "youngEmail",
    "youngPhone",
    "parent1FirstName",
    "parent1LastName",
    "parent1Address",
    "parent1City",
    "parent1Department",
    "parent1Phone",
    "parent1Email",
    "parent2FirstName",
    "parent2LastName",
    "parent2Address",
    "parent2City",
    "parent2Department",
    "parent2Phone",
    "parent2Email",
    "missionName",
    "missionObjective",
    "missionAction",
    "missionStartAt",
    "missionEndAt",
    "missionAddress",
    "missionCity",
    "missionZip",
    "missionDuration",
    "missionFrequence",
    "date",
    "projectManagerFirstName",
    "projectManagerLastName",
    "projectManagerRole",
    "projectManagerEmail",
    "structureManagerFirstName",
    "structureManagerLastName",
    "structureManagerRole",
    "structureManagerEmail",
    "tutorFirstName",
    "tutorLastName",
    "tutorRole",
    "tutorEmail",
    "structureSiret",
    "structureName",
    "createdAt.$date",
    "updatedAt.$date",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.tutorFirstName && (item.tutorFirstName = starify(item.tutorFirstName));
  item.tutorLastName && (item.tutorLastName = starify(item.tutorLastName));
  item.tutorEmail && (item.tutorEmail = STAR_EMAIL);
  item.youngFirstName && (item.youngFirstName = starify(item.youngFirstName));
  item.youngLastName && (item.youngLastName = starify(item.youngLastName));
  item.youngBirthdate && (item.youngBirthdate = generateBirthdate());
  item.youngEmail && (item.youngEmail = STAR_EMAIL);
  item.youngPhone && (item.youngPhone = generateNewPhoneNumber());
  item.youngAddress && (item.youngAddress = starify(item.youngAddress));
  item.parent1FirstName && (item.parent1FirstName = starify(item.parent1FirstName));
  item.parent1LastName && (item.parent1LastName = starify(item.parent1LastName));
  item.parent1Email && (item.parent1Email = STAR_EMAIL);
  item.parent1Address && (item.parent1Address = starify(item.parent1Address));
  item.parent1Phone && (item.parent1Phone = generateNewPhoneNumber());
  item.parent2FirstName && (item.parent2FirstName = starify(item.parent2FirstName));
  item.parent2LastName && (item.parent2LastName = starify(item.parent2LastName));
  item.parent2Email && (item.parent2Email = STAR_EMAIL);
  item.parent2Address && (item.parent2Address = starify(item.parent2Address));
  item.parent2Phone && (item.parent2Phone = generateNewPhoneNumber());
  item.missionName && (item.missionName = starify(item.missionName));
  item.missionAddress && (item.missionAddress = starify(item.missionAddress));
  item.missionZip && (item.missionZip = starify(item.missionZip));
  item.missionObjective && (item.missionObjective = starify(item.missionObjective));
  item.missionAction && (item.missionAction = starify(item.missionAction));
  item.missionFrequence && (item.missionFrequence = starify(item.missionFrequence));
  item.missionDuration && (item.missionDuration = starify(item.missionDuration));
  item.projectManagerFirstName && (item.projectManagerFirstName = starify(item.projectManagerFirstName));
  item.projectManagerLastName && (item.projectManagerLastName = starify(item.projectManagerLastName));
  item.projectManagerEmail && (item.projectManagerEmail = STAR_EMAIL);
  item.structureName && (item.structureName = starify(item.structureName));
  item.structureManagerEmail && (item.structureManagerEmail = STAR_EMAIL);
  item.structureManagerFirstName && (item.structureManagerFirstName = starify(item.structureManagerFirstName));
  item.structureManagerLastName && (item.structureManagerLastName = starify(item.structureManagerLastName));

  item.parent1Token = "";
  item.projectManagerToken = "";
  item.structureManagerToken = "";
  item.parent2Token = "";
  item.youngContractToken = "";

  return item;
}

module.exports = anonymize;
