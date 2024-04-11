const path = require("path");
const PDFDocument = require("pdfkit");
const { getSignedUrl } = require("../../utils");
const { getDepartureDateSession, getReturnDateSession } = require("../../utils/cohort");
const { MINISTRES, getCohortEndDate, transportDatesToString } = require("snu-lib");
const SessionPhase1Model = require("../../models/sessionPhase1");
const CohesionCenterModel = require("../../models/cohesionCenter");
const MeetingPointModel = require("../../models/meetingPoint");
const CohortModel = require("../../models/cohort");
const { CERTIFICATE_TEMPLATES_ROOTDIR, FONT_ROOTDIR } = require("../../config");

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


async function fetchDataForYoung(young) {
  const session = await getSession(young);
  const cohort = await getCohort(young);
  const cohesionCenter = await getCohesionCenter(young);
  return { session, cohort, cohesionCenter };
}

const FONT = "Marianne";
const FONT_BOLD = `${FONT}-Bold`;

function initDocument(options={}) {
  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0, ...options });

  doc.registerFont(FONT, path.join(FONT_ROOTDIR, "Marianne/Marianne-Regular.woff"));
  doc.registerFont(FONT_BOLD, path.join(FONT_ROOTDIR, "Marianne/Marianne-Bold.woff"));

  return doc;
}

function render(doc, young, session, cohort, cohesionCenter) {
  const cohortEndDate = getCohortEndDate(young, cohort);

  const ministresData = getMinistres(cohortEndDate);
  const template = ministresData.template;
  const cohesionCenterLocation = getCohesionCenterLocation(cohesionCenter);
  const departureDate = getDepartureDateSession(session, young, cohort);
  const returnDate = getReturnDateSession(session, young, cohort);

  const COHORT = cohortEndDate.getYear() + 1900;
  const COHESION_DATE = transportDatesToString(departureDate, returnDate);
  const COHESION_CENTER_NAME = cohesionCenter.name || "";
  const COHESION_CENTER_LOCATION = cohesionCenterLocation;
  const DATE = cohortEndDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  const page = doc.page;

  doc.font(FONT).fontSize(12).lineGap(12).fillColor("#444");

  doc.image(path.join(CERTIFICATE_TEMPLATES_ROOTDIR, template), 0, 0, { fit: [page.width, page.height], align: "center", valign: "center" });

  doc
    .text(`félicite${ministresData.ministres.length > 1 ? "nt" : ""} `, 150, 280, { continued: true })
    .font(FONT_BOLD)
    .text(`${young.firstName} ${young.lastName}`, { continued: true })
    .font(FONT)
    .text(`, volontaire à l'édition ${COHORT},`)
    .text("pour la réalisation de son ", { continued: true })
    .font(FONT_BOLD)
    .text("séjour de cohésion", { continued: true })
    .font(FONT)
    .text(`, ${COHESION_DATE}, au centre de :`)
    .text(`${COHESION_CENTER_NAME} ${COHESION_CENTER_LOCATION},`)
    .text("validant la ", { continued: true })
    .font(FONT_BOLD)
    .text("phase 1", { continued: true })
    .font(FONT)
    .text(" du Service National Universel.")
    .moveDown()
    .text(`Fait le ${DATE}`);
}

async function generateCertifPhase1(outStream, young) {
  const { session, cohort, cohesionCenter } = await fetchDataForYoung(young);
  const random = Math.random();
  console.time("RENDERING " + random);
  const doc = initDocument();
  doc.pipe(outStream);
  render(doc, young, session, cohort, cohesionCenter);
  doc.end();
  console.timeEnd("RENDERING " + random);
}

function generateBatchCertifPhase1(outStream, youngs, session, cohort, cohesionCenter) {
  const random = Math.random();
  console.time("RENDERING " + random);
  const doc = initDocument({ autoFirstPage: false });
  doc.pipe(outStream);
  for (const young of youngs) {
    doc.addPage();
    render(doc, young, session, cohort, cohesionCenter);
  }
  doc.end();
  console.timeEnd("RENDERING " + random);
}

module.exports = { generateCertifPhase1, generateBatchCertifPhase1 };
