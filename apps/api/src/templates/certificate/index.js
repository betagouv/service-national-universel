const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl, sanitizeAll } = require("../../utils");
const { COHESION_STAY_LIMIT_DATE, COHESION_STAY_END, MINISTRES, END_DATE_PHASE1, PHASE1_YOUNG_ACCESS_LIMIT } = require("snu-lib");
const SessionPhase1Model = require("../../models/sessionPhase1");
const CohesionCenterModel = require("../../models/cohesionCenter");
const MeetingPointModel = require("../../models/meetingPoint");

const getCohesionCenter = async (young) => {
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

  return cohesionCenter;
};

const getCohesionCenterLocation = (cohesionCenter) => {
  let t = "";
  if (cohesionCenter.city) {
    t = `à ${cohesionCenter.city}`;
    if (cohesionCenter.zip) {
      t += `, ${cohesionCenter.zip}`;
    }
  }
  return t;
};

const getMinistres = (date) => {
  if (!date) return;
  for (const item of MINISTRES) {
    if (date < new Date(item.date_end)) return item;
  }
};

const destinataireLabel = ({ firstName, lastName }, ministres) => {
  return `félicite${ministres.length > 1 ? "nt" : ""} <strong>${firstName} ${lastName}</strong>`;
};

const phase1 = async (young) => {
  const d = COHESION_STAY_END[young.cohort];
  const html = fs.readFileSync(path.resolve(__dirname, "./phase1.html"), "utf8");
  const ministresData = getMinistres(d);
  const template = ministresData.template;
  const cohesionCenter = await getCohesionCenter(young);
  const cohesionCenterLocation = getCohesionCenterLocation(cohesionCenter);
  return html
    .replace(/{{TO}}/g, sanitizeAll(destinataireLabel(young, ministresData.ministres)))
    .replace(/{{COHORT}}/g, sanitizeAll({ ...END_DATE_PHASE1, ...PHASE1_YOUNG_ACCESS_LIMIT }[young.cohort].getYear() + 1900))
    .replace(/{{COHESION_DATE}}/g, sanitizeAll(COHESION_STAY_LIMIT_DATE[young.cohort].toLowerCase()))
    .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(cohesionCenter.name || ""))
    .replace(/{{COHESION_CENTER_LOCATION}}/g, sanitizeAll(cohesionCenterLocation))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(template)))
    .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

const phase2 = (young) => {
  const d = young.statusPhase2ValidatedAt;
  if (!d) throw "Date de validation de la phase 2 non trouvée";
  const ministresData = getMinistres(d);
  const template = ministresData.template;
  const html = fs.readFileSync(path.resolve(__dirname, "./phase2.html"), "utf8");
  return html
    .replace(/{{TO}}/g, sanitizeAll(destinataireLabel(young, ministresData.ministres)))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(template)))
    .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

const phase3 = (young) => {
  const d = young.statusPhase3ValidatedAt;
  if (!d) throw "Date de validation de la phase 3 non trouvée";
  const ministresData = getMinistres(d);
  const template = ministresData.template;
  const html = fs.readFileSync(path.resolve(__dirname, "./phase3.html"), "utf8");
  return html
    .replace(/{{TO}}/g, sanitizeAll(destinataireLabel(young, ministresData.ministres)))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(template)))
    .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

const snu = (young) => {
  const d = young.statusPhase2ValidatedAt;
  if (!d) throw "Date de validation de la phase 2 non trouvée";
  const ministresData = getMinistres(d);
  const template = ministresData.template;
  const html = fs.readFileSync(path.resolve(__dirname, "./snu.html"), "utf8");
  return html
    .replace(/{{TO}}/g, sanitizeAll(destinataireLabel(young, ministresData.ministres)))
    .replace(/{{COHORT}}/g, sanitizeAll(young.cohort))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(template)))
    .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
};

module.exports = { phase1, phase2, phase3, snu };
