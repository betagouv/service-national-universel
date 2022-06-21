const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl, sanitizeAll } = require("../../utils");
const { COHESION_STAY_LIMIT_DATE, COHESION_STAY_END } = require("snu-lib");
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

function getBgUrl({ cohort } = { cohort: "" }) {
  if (cohort === "2019") return getSignedUrl("certificates/certificateTemplate-2019.png");
  if (["2020", "2021", "Février 2022"].includes(cohort)) return getSignedUrl("certificates/certificateTemplate.png");
  if (["Juin 2022", "Juillet 2022"].includes(cohort)) return getSignedUrl("certificates/certificateTemplate_2022.png");
  return getSignedUrl("certificates/certificateTemplate.png");
}

const phase1 = async (young) => {
  const now = new Date();
  const html = fs.readFileSync(path.resolve(__dirname, "./phase1.html"), "utf8");
  const template = getBgUrl({ cohort: young.cohort });
  if (!template) return;

  const session = await SessionPhase1Model.findById(young.sessionPhase1Id);
  if (!session) return;
  const cohesionCenter = await CohesionCenterModel.findById(session.cohesionCenterId);
  if (!cohesionCenter) return;

  const COHESION_CENTER_LOCATION = getLocationCohesionCenter(cohesionCenter);

  // on prend la date de fin de séjour si on édite l'attestation après la date de fin de séjour
  const date = COHESION_STAY_END[young.cohort].getTime() < now.getTime() ? COHESION_STAY_END[young.cohort] : now;

  const destinaireLabelEnFonctionDeLaCohorte = (cohort) => {
    if (["Juin 2022", "Juillet 2022"].includes(cohort)) return `félicite <strong>${young.firstName} ${young.lastName}</strong>`;
    else return `félicitent <strong>${young.firstName} ${young.lastName}</strong>`;
  };

  return html
    .replace(/{{TO}}/g, sanitizeAll(destinaireLabelEnFonctionDeLaCohorte(young.cohort)))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{COHESION_DATE}}/g, sanitizeAll(COHESION_STAY_LIMIT_DATE[young.cohort].toLowerCase()))
    .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(cohesionCenter.name || ""))
    .replace(/{{COHESION_CENTER_LOCATION}}/g, sanitizeAll(COHESION_CENTER_LOCATION))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(template))
    .replace(/{{DATE}}/g, sanitizeAll(date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
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
    .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
    .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getBgUrl()))
    .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

const phase3 = (young) => {
  const d = new Date();
  const html = fs.readFileSync(path.resolve(__dirname, "./phase3.html"), "utf8");
  return html
    .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
    .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getBgUrl()))
    .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

const snu = (young) => {
  const d = new Date();
  const html = fs.readFileSync(path.resolve(__dirname, "./snu.html"), "utf8");
  return html
    .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
    .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getBgUrl()))
    .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

module.exports = { phase1, phase2, phase3, snu };
