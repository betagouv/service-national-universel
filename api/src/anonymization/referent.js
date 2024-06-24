const { generateRandomName, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");

function anonymize(item) {
  item.phone && (item.phone = generateNewPhoneNumber());
  item.mobile && (item.mobile = generateNewPhoneNumber());
  item.email && (item.email = generateRandomEmail());
  item.firstName && (item.firstName = generateRandomName());
  item.lastName && (item.lastName = generateRandomName());
  return item;
}

module.exports = anonymize;
