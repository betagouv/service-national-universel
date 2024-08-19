const { generateAddress, starify } = require("../utils/anonymise");

function anonymize(item) {
  item.departureAddress && (item.departureAddress = generateAddress());
  item.centerCode && (item.centerCode = starify(item.centerCode));
  return item;
}

module.exports = anonymize;
