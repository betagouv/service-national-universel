const { starify } = require("../../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../../utils/anonymise-model-fields");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "cohort",
    "cohortId",
    "lineId",
    "lineName",
    "requestMessage",
    "requestUserId",
    "requestUserName",
    "requestUserRole",
    "tagIds",
    "status",
    "statusUserId",
    "statusUserName",
    "statusDate.$date",
    "opinion",
    "opinionUserId",
    "opinionUserName",
    "opinionDate.$date",
    "messages.message",
    "messages.userId",
    "messages.userName",
    "messages.date.$date",
    "createdAt.$date",
    "updatedAt.$date",
    "deletedAt.$date",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.requestMessage && (item.requestMessage = starify(item.requestMessage));
  item.requestUserName && (item.requestUserName = starify(item.requestUserName));
  item.statusUserName && (item.statusUserName = starify(item.statusUserName));
  item.opinionUserName && (item.opinionUserName = starify(item.opinionUserName));
  item.messages &&
    (item.messages = item.messages.map((message) => {
      message.message = starify(message.message);
      message.userName = starify(message.userName);
      return message;
    }));

  return item;
}

module.exports = anonymize;
