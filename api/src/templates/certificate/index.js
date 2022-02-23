const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl } = require("../../utils");
const { COHESION_STAY_LIMIT_DATE } = require("snu-lib");
const SessionPhase1Model = require("../../models/sessionPhase1");
const CohesionCenterModel = require("../../models/cohesionCenter");

const getLocationCohesionCenter = (cohesionCenter) => {
  let t = "";
  if (cohesionCenter.city) {
    t = `à ${cohesionCenter.city}`;
    if (cohesionCenter.zip) {
      t += `, ${cohesionCenter.zip}`;
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

const phase1 = async (young) => {
  const d = new Date();
  const html = fs.readFileSync(path.resolve(__dirname, "./phase1.html"), "utf8");
  const template = young.cohort === "2019" ? getBgUrl2019() : getBgUrl();

  const session = await SessionPhase1Model.findById(young.sessionPhase1Id);
  if (!session) return;
  const cohesionCenter = await CohesionCenterModel.findById(session.cohesionCenterId);
  if (!cohesionCenter) return;

  const COHESION_CENTER_LOCATION = getLocationCohesionCenter(cohesionCenter);
  return html
    .replace(/{{FIRST_NAME}}/g, young.firstName)
    .replace(/{{LAST_NAME}}/g, young.lastName)
    .replace(/{{COHORT}}/g, young.cohort)
    .replace(/{{COHESION_DATE}}/g, COHESION_STAY_LIMIT_DATE[young.cohort].toLowerCase())
    .replace(/{{COHESION_CENTER_NAME}}/g, cohesionCenter.name || "")
    .replace(/{{COHESION_CENTER_LOCATION}}/g, COHESION_CENTER_LOCATION)
    .replace(/{{BASE_URL}}/g, getBaseUrl())
    .replace(/{{GENERAL_BG}}/g, template)
    .replace(/{{DATE}}/g, d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }));
};

const phase2 = (young) => {
  let d = young.statusPhase2UpdatedAt;
  if (!d) {
    // 31 mars 2021
    if (young.cohort === "2019") d = new Date(2021, 2, 31);
    // 17 juin 2021
    else if (young.cohort === "2020") d = new Date(2021, 5, 17);
    else d = new Date();
  }
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
