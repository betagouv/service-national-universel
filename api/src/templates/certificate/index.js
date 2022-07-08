const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl, sanitizeAll } = require("../../utils");
const { COHESION_STAY_LIMIT_DATE, COHESION_STAY_END, END_DATE_PHASE1, MINISTRES } = require("snu-lib");
const SessionPhase1Model = require("../../models/sessionPhase1");
const CohesionCenterModel = require("../../models/cohesionCenter");
const MeetingPointModel = require("../../models/meetingPoint");

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

function getCertificateTemplate({ cohort } = { cohort: "" }) {
  if (cohort === "2019") return "certificates/certificateTemplate-2019.png";
  if (["2020", "2021", "Février 2022"].includes(cohort)) return "certificates/certificateTemplate.png";
  if (["Juin 2022"].includes(cohort)) return "certificates/certificateTemplate_2022.png";
  if (["Juillet 2022"].includes(cohort)) return "certificates/certificateTemplate_juillet_2022.png";
  return "certificates/certificateTemplate.png";
}

function getCertificateTemplateFromDate(date) {
  if (!date) return;
  for (const item of MINISTRES) {
    if (date < new Date(item.date_end)) return item.template;
  }
}

const destinataireLabel = ({ firstName, lastName }, template) => {
  const isPluriel = template !== "certificates/certificateTemplate_2022.png";

  return `félicite${isPluriel ? "nt" : ""} <strong>${firstName} ${lastName}</strong>`;
};

const phase1 = async (young) => {
  const now = new Date();
  const html = fs.readFileSync(path.resolve(__dirname, "./phase1.html"), "utf8");
  const template = getCertificateTemplateFromDate(END_DATE_PHASE1[young.cohort]);
  if (!template) return;

  let cohesionCenter;

  let session = await SessionPhase1Model.findById(young.sessionPhase1Id);
  let cohesionId = session?.cohesionCenterId || young?.cohesionCenterId;
  if (!cohesionId) {
    const mp = await MeetingPointModel.findById(young.meetingPointId);
    cohesionCenter = await CohesionCenterModel.findById(mp?.centerId);
    if (!cohesionCenter) return;
  } else {
    cohesionCenter = await CohesionCenterModel.findById(cohesionId);
    if (!cohesionCenter) return;
  }

  const COHESION_CENTER_LOCATION = getLocationCohesionCenter(cohesionCenter);

  // on prend la date de fin de séjour si on édite l'attestation après la date de fin de séjour
  const date = COHESION_STAY_END[young.cohort].getTime() < now.getTime() ? COHESION_STAY_END[young.cohort] : now;

  return html
    .replace(/{{TO}}/g, sanitizeAll(destinataireLabel(young, template)))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{COHESION_DATE}}/g, sanitizeAll(COHESION_STAY_LIMIT_DATE[young.cohort].toLowerCase()))
    .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(cohesionCenter.name || ""))
    .replace(/{{COHESION_CENTER_LOCATION}}/g, sanitizeAll(COHESION_CENTER_LOCATION))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(template)))
    .replace(/{{DATE}}/g, sanitizeAll(date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

const phase2 = (young) => {
  const d = young.statusPhase2ValidatedAt;
  if (!d) throw "Date de validation de la phase 2 non trouvée";
  const template = getCertificateTemplateFromDate(d);
  const html = fs.readFileSync(path.resolve(__dirname, "./phase2.html"), "utf8");

  return html
    .replace(/{{TO}}/g, sanitizeAll(destinataireLabel(young, template)))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(template)))
    .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

const phase3 = (young) => {
  const d = young.statusPhase3ValidatedAt;
  if (!d) throw "Date de validation de la phase 3 non trouvée";
  const template = getCertificateTemplateFromDate(d);
  const html = fs.readFileSync(path.resolve(__dirname, "./phase3.html"), "utf8");

  return html
    .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
    .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(template)))
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
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(getCertificateTemplate())))
    .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

module.exports = { phase1, phase2, phase3, snu };
