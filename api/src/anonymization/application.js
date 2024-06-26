const { starify } = require("../utils/anonymise");

function anonymize(item) {
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

  return item;
}

module.exports = anonymize;
