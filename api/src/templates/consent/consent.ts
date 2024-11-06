import { withPipeStream } from "../utils";
import { logger } from "../../logger";
import { FONT, FONT_BOLD, checkBox, initDocument, getLogo, getSignature } from "../templateService";
import { getYoungValidationDate } from "../../young/youngService";

const FILL_COLOR = "#000000";

function render(doc, young) {
  let _y;

  doc.font(FONT);

  getLogo(doc);

  doc.fontSize(10).font(FONT_BOLD).text("CONSENTEMENT DANS LE CADRE D’UNE INSCRIPTION AU SERVICE NATIONAL UNIVERSEL", {
    paragraphGap: 10,
    align: "center",
  });

  doc.moveDown();
  doc.moveDown();

  doc.fontSize(10).font(FONT_BOLD).text("Je, soussigné(e) : ", { continued: true }).font(FONT).text(`${young.parent1FirstName} ${young.parent1LastName}`);

  doc.moveDown();
  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, FILL_COLOR, true);
  doc
    .font(FONT_BOLD)
    .text("confirme être le représentant légal de : ", { continued: true, indent: 75 - 50 })
    .font(FONT)
    .text(`${young.firstName} ${young.lastName}`);

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, FILL_COLOR, true);
  doc
    .font(FONT_BOLD)
    .text(
      `l’autorise à s’engager comme volontaire du Service National Universel et à participer à une session du séjour de cohésion au titre de l’année scolaire 2024-2025.`,
      75,
      _y,
      {
        align: "left",
        width: doc.page.width - 75 - 50,
      },
    );

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, FILL_COLOR, true);
  doc.font(FONT_BOLD).text(`m’engage à communiquer la fiche sanitaire de mon enfant au responsable du séjour de cohésion.`);

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, FILL_COLOR, true);
  doc
    .font(FONT_BOLD)
    .text(`m’engage à ce que mon enfant soit à jour de ses vaccinations obligatoires contre la diphtérie, le tétanos, la poliomyélite (et fièvre jaune pour la Guyane).`, {
      indent: 50 - 50,
    });

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, FILL_COLOR, true);
  doc.font(FONT_BOLD).text(`m’engage à renseigner le consentement relatif aux droits à l’image avant le début du séjour de cohésion.`);

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, FILL_COLOR, true);
  doc.font(FONT_BOLD).text(`reconnais avoir pris connaissance du règlement intérieur du séjour de cohésion.`);

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, FILL_COLOR, true);
  doc.font(FONT_BOLD).text(`accepte la collecte et le traitement des données personnelles de mon enfant effectués dans le cadre d’une mission d’intérêt public.`);

  doc.moveDown();
  doc.moveDown();
  doc.moveDown();

  const validationDate = getYoungValidationDate(young);

  _y = doc.y;

  getSignature(doc, _y, young.city, validationDate);

  doc.moveDown();
}

function generateBatchConsentement(outStream, youngs) {
  const timer = logger.startTimer();
  const doc = initDocument(100, 30, 50, 50, { autoFirstPage: false });
  withPipeStream(doc, outStream, () => {
    for (const young of youngs) {
      doc.addPage();
      render(doc, young);
    }
  });
  timer.done({ message: "RENDERING", level: "debug" });
}

module.exports = { generateBatchConsentement };
