function anonymize(item) {
  item.code2022 && (item.code2022 = "02022");
  item.code && (item.code = "00000");
  return item;
}

module.exports = anonymize;
