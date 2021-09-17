const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl } = require("../../utils");
const { COHESION_STAY_LIMIT_DATE } = require("snu-lib");

const getLocationCohesionCenter = (y) => {
  let t = "";
  if (y.cohesionCenterCity) {
    t = `à ${y.cohesionCenterCity}`;
    if (y.cohesionCenterZip) {
      t += `, ${y.cohesionCenterZip}`;
    }
  }
  return t;
};

function getBgUrl() {
  return getSignedUrl("certificates/certificateTemplate.png");
}

function getBgUrl2019() {
  return getSignedUrl("certificates/certificateTemplate-2019.png");
}

const phase1 = (young) => {
  const d = new Date();
  const html = fs.readFileSync(path.resolve(__dirname, "./phase1.html"), "utf8");
  const template = young.cohort === "2019" ? getBgUrl2019() : getBgUrl();
  const COHESION_CENTER_LOCATION = getLocationCohesionCenter(young);
  return html
    .replace(/{{FIRST_NAME}}/g, young.firstName)
    .replace(/{{LAST_NAME}}/g, young.lastName)
    .replace(/{{COHORT}}/g, young.cohort)
    .replace(/{{COHESION_DATE}}/g, COHESION_STAY_LIMIT_DATE[young.cohort].toLowerCase())
    .replace(/{{COHESION_CENTER_NAME}}/g, young.cohesionCenterName || "")
    .replace(/{{COHESION_CENTER_LOCATION}}/g, COHESION_CENTER_LOCATION)
    .replace(/{{BASE_URL}}/g, getBaseUrl())
    .replace(/{{GENERAL_BG}}/g, template)
    .replace(/{{DATE}}/g, "2 juillet 2021");
};

const phase2 = (young) => {
  const d = new Date();
  const html = fs.readFileSync(path.resolve(__dirname, "./phase2.html"), "utf8");
  return html
    .replace(/{{FIRST_NAME}}/g, young.firstName)
    .replace(/{{LAST_NAME}}/g, young.lastName)
    .replace(/{{COHORT}}/g, young.cohort)
    .replace(/{{BASE_URL}}/g, getBaseUrl())
    .replace(/{{GENERAL_BG}}/g, getBgUrl())
    .replace(/{{DATE}}/g, d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }));
};

const phase3 = (young) => {
  const d = new Date();
  const html = fs.readFileSync(path.resolve(__dirname, "./phase3.html"), "utf8");
  return html
    .replace(/{{FIRST_NAME}}/g, young.firstName)
    .replace(/{{LAST_NAME}}/g, young.lastName)
    .replace(/{{COHORT}}/g, young.cohort)
    .replace(/{{BASE_URL}}/g, getBaseUrl())
    .replace(/{{GENERAL_BG}}/g, getBgUrl())
    .replace(/{{DATE}}/g, d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }));
};

const snu = (young) => {
  const d = new Date();
  const html = fs.readFileSync(path.resolve(__dirname, "./snu.html"), "utf8");
  return html
    .replace(/{{FIRST_NAME}}/g, young.firstName)
    .replace(/{{LAST_NAME}}/g, young.lastName)
    .replace(/{{COHORT}}/g, young.cohort)
    .replace(/{{BASE_URL}}/g, getBaseUrl())
    .replace(/{{GENERAL_BG}}/g, getBgUrl())
    .replace(/{{DATE}}/g, d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }));
};

module.exports = { phase1, phase2, phase3, snu };
