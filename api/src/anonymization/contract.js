const { generateBirthdate, generateNewPhoneNumber, starify, STAR_EMAIL } = require("../utils/anonymise");
const { contractSchemaFields, anonymizeNewFields } = require("../utils/anonymise-model-fields");

function anonymize(item) {
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

  const knownFields = [
    "tutorFirstName",
    "tutorLastName",
    "tutorEmail",
    "youngFirstName",
    "youngLastName",
    "youngBirthdate",
    "youngEmail",
    "youngPhone",
    "youngAddress",
    "parent1FirstName",
    "parent1LastName",
    "parent1Email",
    "parent1Address",
    "parent1Phone",
    "parent2FirstName",
    "parent2LastName",
    "parent2Email",
    "parent2Address",
    "parent2Phone",
    "missionName",
    "missionAddress",
    "missionZip",
    "missionObjective",
    "missionAction",
    "missionFrequence",
    "missionDuration",
    "projectManagerFirstName",
    "projectManagerLastName",
    "projectManagerEmail",
    "structureName",
    "structureManagerEmail",
    "structureManagerFirstName",
    "structureManagerLastName",
    "parent1Token",
    "projectManagerToken",
    "structureManagerToken",
    "parent2Token",
    "youngContractToken",
  ];

  return anonymizeNewFields(item, knownFields, contractSchemaFields);
}

module.exports = anonymize;
