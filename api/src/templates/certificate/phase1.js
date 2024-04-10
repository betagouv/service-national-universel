const path = require('path');
const { getSignedUrl, } = require("../../utils");
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

async function generate(doc, young) {
  const session = await getSession(young);
  const cohort = await getCohort(young);
  const cohortEndDate = getCohortEndDate(young, cohort);

  const ministresData = getMinistres(cohortEndDate);
  const template = ministresData.template;
  const cohesionCenter = await getCohesionCenter(young);
  const cohesionCenterLocation = getCohesionCenterLocation(cohesionCenter);
  const meetingPoint = await getMeetingPoint(young);
  const departureDate = await getDepartureDateSession(meetingPoint, session, young, cohort);
  const returnDate = await getReturnDateSession(meetingPoint, session, young, cohort);

  const COHORT = cohortEndDate.getYear() + 1900;
  const COHESION_DATE = transportDatesToString(departureDate, returnDate);
  const COHESION_CENTER_NAME = cohesionCenter.name || "";
  const COHESION_CENTER_LOCATION = cohesionCenterLocation;
  const GENERAL_BG = getSignedUrl(template);
  const DATE = cohortEndDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  const page = doc.page;
  const font = doc._font.name;

  doc
    .fontSize(14)
    .lineGap(14)
    .fillColor("#444");

  doc.image(path.join(__dirname, "..", "..", "..", "/public/images/certificateTemplate_template.png"), 0, 0, { fit: [page.width, page.height], align: "center", valign: "center" });

  doc
    .text(`félicite${ministresData.ministres.length > 1 ? "nt" : ""} `, 150, 300, {continued: true})
    .font(`${font}-Bold`)
    .text(`${young.firstName} ${young.lastName}`, {continued: true})
    .font(font)
    .text(`, volontaire à l'édition ${COHORT},`)
    .text("pour la réalisation de son ", {continued: true})
    .font(`${font}-Bold`)
    .text("séjour de cohésion", {continued: true})
    .font(font)
    .text(`, ${COHESION_DATE}, au centre de :`)
    .text(`${COHESION_CENTER_NAME} ${COHESION_CENTER_LOCATION},`)
    .text("validant la ", {continued: true})
    .font(`${font}-Bold`)
    .text("phase 1", {continued: true})
    .font(font)
    .text(" du Service National Universel.")
    .moveDown()
    .text(`Fait le ${DATE}`);
}

module.exports = { generate };
