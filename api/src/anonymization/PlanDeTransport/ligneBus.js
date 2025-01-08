const { generateRandomName, generateBirthdate, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "cohort",
    "cohortId",
    "busId",
    "departuredDate",
    "returnDate",
    "youngCapacity",
    "totalCapacity",
    "followerCapacity",
    "youngSeatsTaken",
    "travelTime",
    "lunchBreak",
    "lunchBreakReturn",
    "sessionId",
    "centerId",
    "centerArrivalTime",
    "centerDepartureTime",
    "classeId",
    "meetingPointsIds",
    "team",
    "team.lastName",
    "team.firstName",
    "team.birthdate",
    "team.mail",
    "team.phone",
    "delayedForth",
    "delayedBack",
    "mergedBusIds",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.team &&
    (item.team = item.team.map((t) => {
      t.lastName && (t.lastName = generateRandomName());
      t.firstName && (t.firstName = generateRandomName());
      t.birthdate && (t.birthdate = generateBirthdate());
      t.mail && (t.mail = generateRandomEmail());
      t.phone && (t.phone = generateNewPhoneNumber());
      return t;
    }));

  return item;
}

module.exports = anonymize;
