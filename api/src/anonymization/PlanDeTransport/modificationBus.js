const { starify } = require("../../utils/anonymise");

function anonymize(item) {
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
