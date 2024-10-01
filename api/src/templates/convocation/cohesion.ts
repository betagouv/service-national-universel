import path from "path";
import config from "config";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { withPipeStream } from "../utils";
import { getDepartureDateSession, getReturnDateSession } from "../../utils/cohort";
import { formatStringDate, formatStringDateTimezoneUTC, transportDatesToString } from "snu-lib";
import { getMeetingAddress, getCertificateTemplate, isLocalTransport, fetchDataForYoungCertificate } from "../../young/youngCertificateService";
import { FONT, FONT_BOLD, FONT_ITALIC, LIST_INDENT, initDocument } from "../templateService";
import { logger } from "../../logger";

const FILL_COLOR = "#444";
const MARGIN = 50;

function render(doc, { young, session, cohort, center, service, meetingPoint, ligneBus, ligneToPoint }) {
  let _y;
  const page = doc.page;

  const contacts = service?.contacts.filter((c) => c.cohort === young.cohort).slice(0, 4) || [];
  const departureDate = getDepartureDateSession(session, young, cohort);
  const returnDate = getReturnDateSession(session, young, cohort);

  doc.font(FONT).fillColor(FILL_COLOR).fontSize(9);

  if (config.ENVIRONMENT !== "test") {
    doc.image(path.join(config.IMAGES_ROOTDIR, getCertificateTemplate(young)), 0, 0, {
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

  let stuff: string[] = [];
  if (young.source !== "CLE") {
    stuff = ["votre convocation", "une pièce d'identité"];
  }
  stuff.push("la fiche sanitaire complétée, sous enveloppe destinée au référent sanitaire");
  if (ligneBus?.lunchBreak) {
    stuff.push("un repas froid selon la durée de votre trajet entre le lieu de rassemblement et le centre du séjour");
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

async function generateCohesion(outStream, young) {
  const timer = logger.startTimer();
  const data = await fetchDataForYoungCertificate(young);
  const doc = initDocument(75, 30, MARGIN, MARGIN, {});
  withPipeStream(doc, outStream, () => {
    render(doc, { young, ...data });
  });
  timer.done({ message: "RENDERING", level: "debug" });
}

async function generateBatchCohesion(outStream, youngs) {
  const timer = logger.startTimer();
  let commonYoungData = await getYoungCommonData(youngs);
  const doc = initDocument(75, 30, MARGIN, MARGIN, { autoFirstPage: false });
  withPipeStream(doc, outStream, () => {
    for (const young of youngs) {
      doc.addPage();
      render(doc, { young, ...commonYoungData });
    }
  });
  timer.done({ message: "RENDERING", level: "debug" });
}

async function getYoungCommonData(youngs) {
  return await fetchDataForYoungCertificate(youngs[0]);
}

module.exports = { generateCohesion, generateBatchCohesion };
