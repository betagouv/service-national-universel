const { generateRandomName, generateRandomEmail, generateAddress, starify } = require("../utils/anonymise");

function anonymize(item) {
  item.message && (item.message = starify(item.message));
  item.address && (item.address = generateAddress());
  item.contactEmail && (item.contactEmail = generateRandomEmail());
  item.contactFullName && (item.contactFullName = generateRandomName() + generateRandomName());
  item.structureName && (item.structureName = generateRandomName());
  item.files && (item.files = []);
  return item;
}

module.exports = anonymize;
