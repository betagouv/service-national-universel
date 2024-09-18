import path from "path";
import { getDepartureDateSession, getReturnDateSession } from "../../utils/cohort";
import { getCohortEndDate, transportDatesToString } from "snu-lib";
import { SessionPhase1Model, CohesionCenterModel, MeetingPointModel, CohortModel } from "../../models";
import config from "config";
import { logger } from "../../logger";
import { ERRORS } from "../../utils/errors";
import { initDocument, getMinistres, getCohesionCenterLocation, FONT, FONT_BOLD, FONT_SIZE, LINE_GAP, FILL_COLOR } from "./utils";
import { withPipeStream } from "../utils";

import type PDFDocument from "pdfkit";

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

function render(doc: typeof PDFDocument, young, session, cohort, cohesionCenter) {
  if (!cohesionCenter) {
    throw new Error(ERRORS.NO_COHESION_CENTER_FOUND);
  }
  const cohortEndDate = getCohortEndDate(cohort);

  const ministresData = getMinistres(cohortEndDate);
  if (!ministresData) throw new Error("NO_MINISTRES_FOUND");
  const template = ministresData.template;
  const cohesionCenterLocation = getCohesionCenterLocation(cohesionCenter);
  const departureDate = getDepartureDateSession(session, young, cohort);
  const returnDate = getReturnDateSession(session, young, cohort);

  const COHORT = cohortEndDate.getFullYear();
  const COHESION_DATE = transportDatesToString(departureDate, returnDate);
  const COHESION_CENTER_NAME = cohesionCenter.name || "";
  const COHESION_CENTER_LOCATION = cohesionCenterLocation;
  const DATE = cohortEndDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  const page = doc.page;

  doc.font(FONT).fontSize(FONT_SIZE).lineGap(LINE_GAP).fillColor(FILL_COLOR);

  if (config.ENVIRONMENT !== "test") {
    doc.image(path.join(config.IMAGES_ROOTDIR, template), 0, 0, { fit: [page.width, page.height], align: "center", valign: "center" });
  }
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
    .text(" du Service National Universel.");
  doc.y += 12;
  doc.text(`Fait le ${DATE}`);
}

async function generateCertifPhase1(outStream, young) {
  const { session, cohort, cohesionCenter } = await fetchDataForYoung(young);
  const timer = logger.startTimer();
  const doc = initDocument();
  withPipeStream(doc, outStream, () => {
    render(doc, young, session, cohort, cohesionCenter);
  });
  timer.done({ message: "RENDERING", level: "debug" });
}

function generateBatchCertifPhase1(outStream, youngs, session, cohort, cohesionCenter) {
  const timer = logger.startTimer();
  const doc = initDocument({ autoFirstPage: false });
  withPipeStream(doc, outStream, () => {
    for (const young of youngs) {
      doc.addPage();
      render(doc, young, session, cohort, cohesionCenter);
    }
  });
  timer.done({ message: "RENDERING", level: "debug" });
}

export { generateCertifPhase1, generateBatchCertifPhase1 };
