const fs = require("fs");
const path = require("path");
const config = require("../../config");
const { getSignedUrl } = require("../../utils");

const getLocationCohesionCenter = (y) => {
  let t = "";
  if (y.cohestionCenterCity) {
    t = `à ${y.cohestionCenterCity}`;
    if (y.cohestionCenterZip) {
      t += `, ${y.cohestionCenterZip}`;
    }
  }
  return t;
};

const getBaseUrl = () => {
  if (config.ENVIRONMENT === "staging") return "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  if (config.ENVIRONMENT === "production") return "https://app-5a3e097d-fdf1-44fa-9172-88ad9d7b2b20.cleverapps.io";
  return "http://localhost:8080";
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
    .replace(/{{COHESION_CENTER_NAME}}/g, young.cohesionCenterName || "")
    .replace(/{{COHESION_CENTER_LOCATION}}/g, COHESION_CENTER_LOCATION)
    .replace(/{{BASE_URL}}/g, getBaseUrl())
    .replace(/{{GENERAL_BG}}/g, template)
    .replace(/{{DATE}}/g, d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }));
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
