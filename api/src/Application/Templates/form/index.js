const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl, sanitizeAll } = require("../../Utils");

function getBgImageRight(page) {
  if (page) return getSignedUrl(`form/formImageRight-${page}.png`);
  return getSignedUrl("form/formImageRight.png");
}

const imageRight = (young) => {
  const html = fs.readFileSync(path.resolve(__dirname, "./imageRight.html"), "utf8");
  return html
    .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
    .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
    .replace(/{{REPRESENTANT_1_FIRST_NAME}}/g, sanitizeAll(young.firstName1 || ""))
    .replace(/{{REPRESENTANT_1_LAST_NAME}}/g, sanitizeAll(young.lastName1 || ""))
    .replace(/{{REPRESENTANT_2_FIRST_NAME}}/g, sanitizeAll(young.firstName2 || ""))
    .replace(/{{REPRESENTANT_2_LAST_NAME}}/g, sanitizeAll(young.lastName2 || ""))
    .replace(/{{CONSENTMENT_TRUE}}/g, sanitizeAll(young.imageRight === "true" ? "x" : ""))
    .replace(/{{CONSENTMENT_FALSE}}/g, sanitizeAll(young.imageRight === "false" ? "x" : ""))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG_RECTO}}/g, sanitizeAll(getBgImageRight(1)))
    .replace(/{{GENERAL_BG_VERSO}}/g, sanitizeAll(getBgImageRight(2)));
};

module.exports = { imageRight };
