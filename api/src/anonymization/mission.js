const { generateAddress, generateRandomName, starify } = require("../utils/anonymise");

function anonymize(item) {
  item.name && (item.name = `Mission ${generateRandomName()}`);
  item.description && (item.description = starify(item.description));
  item.address && (item.address = generateAddress());
  item.actions && (item.actions = "action Test");
  item.structureName && (item.structureName = starify(item.structureName));
  item.tutorName && (item.tutorName = starify(item.tutorName));
  item.actions && (item.actions = starify(item.actions));
  item.justifications && (item.justifications = starify(item.justifications));
  item.contraintes && (item.contraintes = starify(item.contraintes));
  item.frequence && (item.frequence = starify(item.frequence));
  item.jvaRawData && (item.jvaRawData = undefined);
  return item;
}

module.exports = anonymize;
