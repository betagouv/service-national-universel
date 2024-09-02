const path = require("path");
const PDFDocument = require("pdfkit");
const config = require("config");
const { logger } = require("../../logger");
const dayjs = require("dayjs");
require("dayjs/locale/fr");
const { withPipeStream } = require("../utils");

const { CohesionCenterModel } = require("../../models");
const { SessionPhase1Model } = require("../../models");
const { CohortModel } = require("../../models");
const { LigneBusModel } = require("../../models");
const { LigneToPointModel } = require("../../models");
const { PointDeRassemblementModel } = require("../../models");
const { DepartmentServiceModel } = require("../../models");
const { getDepartureDateSession, getReturnDateSession } = require("../../utils/cohort");
const { formatStringDate, formatStringDateTimezoneUTC, transportDatesToString, YOUNG_STATUS, FUNCTIONAL_ERRORS } = require("snu-lib");
const { capture } = require("../../sentry");

const FONT = "Marianne";
const FONT_BOLD = `${FONT}-Bold`;
const FONT_ITALIC = `${FONT}_Italic`;

const FILL_COLOR = "#444";
const LIST_INDENT = 15;
const MARGIN = 50;

function isLocalTransport(young) {
  return young.transportInfoGivenByLocal === "true";
}

const getMeetingAddress = (young, meetingPoint, center) => {
  if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return `${center.address} ${center.zip} ${center.city}`;
  const complement = meetingPoint?.complementAddress.find((c) => c.cohort === young.cohort);
  const complementText = complement?.complement ? ", " + complement.complement : "";
  return meetingPoint.name + ", " + meetingPoint.address + " " + meetingPoint.zip + " " + meetingPoint.city + complementText;
};

async function fetchDataForYoung(young) {
  const session = await SessionPhase1Model.findById(young.sessionPhase1Id);
  if (!session) throw new Error(`session ${young.sessionPhase1Id} not found for young ${young._id}`);
  const center = await CohesionCenterModel.findById(session.cohesionCenterId);
  if (!center) throw new Error(`center ${session.cohesionCenterId} not found for young ${young._id} - session ${session._id}`);

  const cohort = await CohortModel.findOne({ name: young.cohort });
  cohort.dateStart.setMinutes(cohort.dateStart.getMinutes() - cohort.dateStart.getTimezoneOffset());
  cohort.dateEnd.setMinutes(cohort.dateEnd.getMinutes() - cohort.dateEnd.getTimezoneOffset());

  let service = null;
  if (young.source !== "CLE") {
    service = await DepartmentServiceModel.findOne({ department: young.department });
    if (!service) throw new Error(`service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`);
  }

  let meetingPoint = null;
  let ligneToPoint = null;
  let ligneBus = null;
  if (!isLocalTransport(young)) {
    meetingPoint = await PointDeRassemblementModel.findById(young.meetingPointId);

    if (meetingPoint && young.ligneId) {
      ligneBus = await LigneBusModel.findById(young.ligneId);
      ligneToPoint = await LigneToPointModel.findOne({ lineId: young.ligneId, meetingPointId: young.meetingPointId });
    }
  }

  return { session, cohort, center, service, meetingPoint, ligneBus, ligneToPoint };
}

function getTemplate(young) {
  if (young.cohort === "Octobre 2023 - NC" && !young.source === "CLE") {
    return "convocation/convocation_template_base_NC.png";
  }
  return "convocation/convocation_template_base_2024_V2.png";
}

function render(doc, { young, session, cohort, center, service, meetingPoint, ligneBus, ligneToPoint }) {
  let _y;
  const page = doc.page;

  const contacts = service?.contacts.filter((c) => c.cohort === young.cohort).slice(0, 4) || [];
  const departureDate = getDepartureDateSession(session, young, cohort);
  const returnDate = getReturnDateSession(session, young, cohort);

  doc.font(FONT).fillColor(FILL_COLOR).fontSize(9);

  if (config.ENVIRONMENT !== "test") {
    doc.image(path.join(config.IMAGES_ROOTDIR, getTemplate(young)), 0, 0, {
      fit: [page.width, page.height],
      align: "center",
      valign: "center",
    });
  }

  doc.font(FONT).text(`Paris, le ${formatStringDate(Date.now())}`, { align: "right" });
  doc.moveDown(3);

  _y = doc.y;
  if (contacts.length && young.source !== "CLE") {
    doc.font(FONT_BOLD).text("Affaire suivie par :", { underline: true, paragraphGap: 5 });
    doc
      .font(FONT)
      .fontSize(8)
      .list(
        contacts.map((contact) => {
          return `${contact.contactName} - ${contact.contactPhone || ""} - ${contact.contactMail || ""}`;
        }),
        { width: 300, bulletRadius: 1.5, baseline: -7 },
      );
  }
  doc.font(FONT_BOLD).fontSize(9);
  doc.text(`${young.firstName} ${young.lastName}`, MARGIN, _y, { align: "right" });
  doc.text(`Né(e) le ${formatStringDateTimezoneUTC(young.birthdateAt)}`, { align: "right" });
  doc.text(young.address, { align: "right" });
  doc.text(`${young.zip} ${young.city}`, { align: "right" });

  doc.moveDown(2);

  doc.fontSize(12).text("CONVOCATION", { align: "center" });
  doc.fontSize(11).text("au séjour de cohésion dans le cadre du service national universel (SNU)", { align: "center" });
  doc.fontSize(9).font(FONT_ITALIC).text("Article R.113-1 du code du service national", { align: "center" });

  doc.moveDown(2);

  doc.font(FONT);
  doc.text(`Je suis heureuse de vous confirmer votre participation au séjour de cohésion du service national universel, ${transportDatesToString(departureDate, returnDate)}.`);
  doc.text(`Votre séjour se déroulera au : `, { continued: true });
  doc.font(FONT_BOLD).text(`${center.name}, ${center.address} ${center.zip} ${center.city}.`);
  doc.font(FONT);

  if (isLocalTransport(young)) {
    doc.text("Vos informations de transports vous seront transmises par email.");
  } else {
    doc.text("Vous voudrez bien vous présenter ", { continued: true });
    doc.font(FONT_BOLD).text("impérativement", { continued: true });
    doc.font(FONT).text(" à la date et au lieu suivants :");

    doc.moveDown(0.5);

    doc.font(FONT).text("Le ", MARGIN + 100, undefined, { continued: true });
    doc.font(FONT_BOLD).text(dayjs(departureDate).locale("fr-FR").format("dddd DD MMMM YYYY"));
    doc.font(FONT).text("A ", { continued: true });
    doc.font(FONT_BOLD).text(meetingPoint && ligneToPoint?.meetingHour ? ligneToPoint.meetingHour : "16:00");
    doc.font(FONT).text("Au ", { continued: true });
    doc.font(FONT_BOLD).text(getMeetingAddress(young, meetingPoint, center));
    if (ligneBus) {
      doc.font(FONT).text("Numéro de transport : ", { continued: true });
      doc.font(FONT_BOLD).text(ligneBus.busId);
    }
  }

  doc.moveDown(1);

  doc
    .lineWidth(1)
    .moveTo(MARGIN, doc.y - 2)
    .lineTo(page.width - MARGIN, doc.y - 2)
    .stroke();
  doc.font(FONT);
  doc
    .fontSize(8)
    .text(
      `Attention à bien respecter l'horaire indiqué. En cas de retard, vous ne pourrez pas effectuer votre séjour de cohésion. Votre représentant légal doit rester jusqu'à votre prise en charge par les accompagnateurs.`,
      MARGIN + 20,
      undefined,
      { width: page.width - 2 * (MARGIN + 20) },
    );
  doc
    .moveTo(MARGIN, doc.y + 5)
    .lineTo(page.width - MARGIN, doc.y + 5)
    .stroke();

  doc.moveDown(1);

  doc.fontSize(9).text(`Il vous est demandé de vous présenter au point de rassemblement avec :`, MARGIN);

  doc.moveDown(0.5);

  let stuff = [];
  if (young.source !== "CLE") {
    stuff = ["votre convocation", "une pièce d'identité"];
  }
  stuff.push("la fiche sanitaire complétée, sous enveloppe destinée au référent sanitaire");
  if (ligneBus?.lunchBreak) {
    stuff.push("une collation ou un déjeuner froid selon la durée de votre trajet entre le lieu de rassemblement et le centre du séjour");
  }
  doc.list(stuff, doc.x + LIST_INDENT, undefined, { bulletRadius: 1.5, textIndent: LIST_INDENT, baseline: -7 });

  doc.moveDown(0.5);

  doc.text(`Enfin, nous vous demandons de bien vouloir étiqueter vos bagages.`, doc.x - LIST_INDENT);

  doc.moveDown(1);

  doc.text(`Le `, { continued: true });
  doc.font(FONT_BOLD).text(`retour de votre séjour`, { continued: true });
  doc.font(FONT).text(` est prévu`, { continued: true });
  if (!isLocalTransport(young)) {
    doc.font(FONT_BOLD).text(` le ${dayjs(returnDate).locale("fr").format("dddd DD MMMM YYYY")}`, { continued: true });
    doc.font(FONT_BOLD).text(` à ${meetingPoint && ligneToPoint ? ligneToPoint.returnHour : "11:00"}`, { continued: true });
  }
  doc.font(FONT).text(` au même endroit que le jour du départ en centre.`);

  doc.moveDown(0.5);

  doc.font(FONT_BOLD);
  doc.text(
    `Votre représentant légal veillera à bien respecter ces modalités de retour (horaire, lieu de prise en charge). Vous ne pourrez repartir seul, sauf si vous présentez une autorisation de votre représentant légal.`,
  );

  doc.moveDown(0.5);

  doc.font(FONT);
  doc.text(`Afin que votre séjour se déroule dans les meilleures conditions, nous vous rappelons que chaque volontaire, lors de son inscription s'est engagé à respecter le `, {
    continued: true,
  });
  doc.font(FONT_BOLD).text(`règlement intérieur`, { continued: true });
  doc.font(FONT).text(` du centre.`);

  doc.moveDown(1);

  doc.text(`Nous vous félicitons pour votre engagement et vous souhaitons un excellent séjour de cohésion.`);
}

function initDocument(options = {}) {
  const doc = new PDFDocument({
    layout: "portrait",
    size: "A4",
    margins: {
      top: 75,
      bottom: 30,
      left: MARGIN,
      right: MARGIN,
    },
    ...options,
  });

  doc.registerFont(FONT, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Regular.woff"));
  doc.registerFont(FONT_BOLD, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Bold.woff"));
  doc.registerFont(FONT_ITALIC, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Regular_Italic.woff"));

  return doc;
}

async function generateCohesion(outStream, young) {
  controlYoungCoherence(young);
  const data = await fetchDataForYoung(young);
  const timer = logger.startTimer();
  const doc = initDocument();
  withPipeStream(doc, outStream, () => {
    render(doc, { young, ...data });
  });
  timer.done({ message: "RENDERING", level: "debug" });
}

async function generateBatchCohesion(outStream, youngs) {
  let commonYoungData = await getYoungCommonData(validatedYoungsWithSession);
  const timer = logger.startTimer();
  const validatedYoungsWithSession = youngs.filter((young) => young.status === YOUNG_STATUS.VALIDATED && young.sessionPhase1Id);
  const doc = initDocument({ autoFirstPage: false });
  withPipeStream(doc, outStream, () => {
    for (const young of validatedYoungsWithSession) {
      controlYoungCoherence(young);
      doc.addPage();
      render(doc, { young, ...commonYoungData });
    }
  });
  timer.done({ message: "RENDERING", level: "debug" });
}

function controlYoungCoherence(young) {
  if (!["AFFECTED", "DONE", "NOT_DONE"].includes(young.statusPhase1)) throw new Error(`young ${young.id} not affected`);
  if (!young.sessionPhase1Id || (!isLocalTransport(young) && !young.meetingPointId && young.deplacementPhase1Autonomous !== "true" && young.source !== "CLE"))
    capture(`young ${young.id} unauthorized`);
}

async function getYoungCommonData(youngs) {
  if (!youngs || youngs.length === 0) {
    throw new Error(FUNCTIONAL_ERRORS.NO_YOUNG_IN_EXPECTED_STATUS);
  }

  return await fetchDataForYoung(youngs[0]);
}

module.exports = { generateCohesion, generateBatchCohesion };
