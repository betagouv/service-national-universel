const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl, sanitizeAll } = require("../../utils");
const { getDepartureDateSession, getReturnDateSession } = require("../../utils/cohort");
const { MINISTRES, getCohortEndDate, transportDatesToString } = require("snu-lib");
const SessionPhase1Model = require("../../models/sessionPhase1");
const CohesionCenterModel = require("../../models/cohesionCenter");
const MeetingPointModel = require("../../models/meetingPoint");
const CohortModel = require("../../models/cohort");
const PointDeRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");

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
  if (cohesionCenter?.city) {
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

const getSession = async (young) => {
  let session = await SessionPhase1Model.findById(young.sessionPhase1Id);
  if (!session) return;

  return session;
};

const getCohort = async (young) => {
  let cohort = await CohortModel.findOne({ name: young.cohort });
  if (!cohort) return;

  return cohort;
};

const getMeetingPoint = async (young) => {
  if (!young.meetingPointId) return;
  let meetingPoint = await PointDeRassemblementModel.findById(young.meetingPointId);
  if (!meetingPoint) return;

  return meetingPoint;
};

const phase1 = async (young, batch = false) => {
  const session = await getSession(young);
  const cohort = await getCohort(young);
  const cohortEndDate = getCohortEndDate(young, cohort);
  const file = batch ? "phase1Batch.html" : "phase1.html";

  const html = fs.readFileSync(path.resolve(__dirname, file), "utf8");
  const ministresData = getMinistres(cohortEndDate);
  const template = ministresData.template;
  const cohesionCenter = await getCohesionCenter(young);
  const cohesionCenterLocation = getCohesionCenterLocation(cohesionCenter);
  const meetingPoint = await getMeetingPoint(young);
  const departureDate = await getDepartureDateSession(meetingPoint, session, young, cohort);
  const returnDate = await getReturnDateSession(meetingPoint, session, young, cohort);

  return html
    .replace(/{{TO}}/g, sanitizeAll(destinataireLabel(young, ministresData.ministres)))
    .replace(/{{COHORT}}/g, sanitizeAll(cohortEndDate.getYear() + 1900))
    .replace(/{{COHESION_DATE}}/g, sanitizeAll(transportDatesToString(departureDate, returnDate)))
    .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(cohesionCenter.name || ""))
    .replace(/{{COHESION_CENTER_LOCATION}}/g, sanitizeAll(cohesionCenterLocation))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(template)))
    .replace(/{{DATE}}/g, sanitizeAll(cohortEndDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })));
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
