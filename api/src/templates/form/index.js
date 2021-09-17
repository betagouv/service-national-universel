const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl } = require("../../utils");

function getBgAutotestPCR(page) {
  if (page) return getSignedUrl(`form/formAutotestPCR-${page}.png`);
  return getSignedUrl("form/formAutotestPCR.png");
}

function getBgImageRight(page) {
  if (page) return getSignedUrl(`form/formImageRight-${page}.png`);
  return getSignedUrl("form/formImageRight.png");
}

const imageRight = (young) => {
  const html = fs.readFileSync(path.resolve(__dirname, "./imageRight.html"), "utf8");
  return html
    .replace(/{{FIRST_NAME}}/g, young.firstName)
    .replace(/{{LAST_NAME}}/g, young.lastName)
    .replace(/{{REPRESENTANT_1_FIRST_NAME}}/g, young.firstName1 || "")
    .replace(/{{REPRESENTANT_1_LAST_NAME}}/g, young.lastName1 || "")
    .replace(/{{REPRESENTANT_2_FIRST_NAME}}/g, young.firstName2 || "")
    .replace(/{{REPRESENTANT_2_LAST_NAME}}/g, young.lastName2 || "")
    .replace(/{{CONSENTMENT_TRUE}}/g, young.imageRight === "true" ? "x" : "")
    .replace(/{{CONSENTMENT_FALSE}}/g, young.imageRight === "false" ? "x" : "")
    .replace(/{{BASE_URL}}/g, getBaseUrl())
    .replace(/{{GENERAL_BG_RECTO}}/g, getBgImageRight(1))
    .replace(/{{GENERAL_BG_VERSO}}/g, getBgImageRight(2));
};

const autotestPCR = (young) => {
  const html = fs.readFileSync(path.resolve(__dirname, "./autotestPCR.html"), "utf8");
  return (
    html
      .replace(/{{FIRST_NAME}}/g, young.firstName)
      .replace(/{{LAST_NAME}}/g, young.lastName)
      .replace(/{{REPRESENTANT_1_FIRST_NAME}}/g, young.firstName1 || "")
      .replace(/{{REPRESENTANT_1_LAST_NAME}}/g, young.lastName1 || "")
      .replace(/{{REPRESENTANT_2_FIRST_NAME}}/g, young.firstName2 || "")
      .replace(/{{REPRESENTANT_2_LAST_NAME}}/g, young.lastName2 || "")
      .replace(/{{REPRESENTANT_PHONE}}/g, young.parentPhone || "")
      .replace(/{{CONSENTMENT_TRUE}}/g, young.autoTestPCR === "true" ? "x" : "")
      .replace(/{{CONSENTMENT_FALSE}}/g, young.autoTestPCR === "false" ? "x" : "")

      .replace(/{{BASE_URL}}/g, getBaseUrl())
      // .replace(/{{GENERAL_BG1}}/g, getBgAutotestPCR1())
      // .replace(/{{GENERAL_BG2}}/g, getBgAutotestPCR2())
      .replace(/{{GENERAL_BG}}/g, getBgAutotestPCR())
  );
};

module.exports = { imageRight, autotestPCR };
