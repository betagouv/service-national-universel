const path = require("path");
const PDFDocument = require("pdfkit");
const config = require("config");
const datefns = require("date-fns");
const { withPipeStream } = require("../utils");

const FONT = "Marianne";
const FONT_BOLD = `${FONT}-Bold`;
const FONT_ITALIC = `${FONT}_Italic`;

const FILL_COLOR = "#000000";
const LIST_INDENT = 15;
const MARGIN = 100;

const CHECKBOX_SIZE = 15;

function checkBox(doc, x, y, checked = false) {
  doc.lineWidth(1).fillColor("fff").roundedRect(x, y, CHECKBOX_SIZE, CHECKBOX_SIZE, 2).stroke().fillColor(FILL_COLOR);
  if (checked) {
    const center = CHECKBOX_SIZE / 2;
    const gap = CHECKBOX_SIZE / 4;
    doc
      .lineWidth(1.5)
      .lineCap("round")
      .moveTo(x + gap, y + center)
      .lineTo(x + center, y + CHECKBOX_SIZE - gap)
      .lineTo(x + CHECKBOX_SIZE - gap, y + gap)
      .stroke();
  }
}

function render(doc, young) {
  let _y;

  doc.font(FONT);

  doc.image(path.join(config.IMAGES_ROOTDIR, "republique-francaise.png"), 0, 0);
  doc.image(path.join(config.IMAGES_ROOTDIR, "logo-snu.png"), 100, 15, { width: 40, height: 40 });

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
  checkBox(doc, 50, _y + 1, true);
  doc
    .font(FONT_BOLD)
    .text("confirme être le représentant légal de : ", { continued: true, indent: 75 - 50 })
    .font(FONT)
    .text(`${young.firstName} ${young.lastName}`);

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, true);
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
  checkBox(doc, 50, _y + 1, true);
  doc.font(FONT_BOLD).text(`m’engage à communiquer la fiche sanitaire de mon enfant au responsable du séjour de cohésion.`);

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, true);
  doc
    .font(FONT_BOLD)
    .text(`m’engage à ce que mon enfant soit à jour de ses vaccinations obligatoires contre la diphtérie, le tétanos, la poliomyélite (et fièvre jaune pour la Guyane).`, {
      indent: 50 - 50,
    });

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, true);
  doc.font(FONT_BOLD).text(`m’engage à renseigner le consentement relatif aux droits à l’image avant le début du séjour de cohésion.`);

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, true);
  doc.font(FONT_BOLD).text(`reconnais avoir pris connaissance du règlement intérieur du séjour de cohésion.`);

  doc.moveDown();
  doc.moveDown();

  _y = doc.y;
  checkBox(doc, 50, _y + 1, true);
  doc.font(FONT_BOLD).text(`accepte la collecte et le traitement des données personnelles de mon enfant effectués dans le cadre d’une mission d’intérêt public.`);

  doc.moveDown();
  doc.moveDown();
  doc.moveDown();

  const validationDate = young.parent1ValidationDate
    ? datefns.format(new Date(young.parent1ValidationDate), "dd/MM/yyyy à HH:mm")
    : young.parent2ValidationDate
      ? datefns.format(new Date(young.parent2ValidationDate), "dd/MM/yyyy à HH:mm")
      : datefns.format(new Date(), "dd/MM/yyyy à HH:mm");

  _y = doc.y;
  doc
    .font(FONT_BOLD)
    .text("Fait à : ", 50, _y, { continued: true })
    .font(FONT)
    .text(`${young.city}`, { continued: true })
    .font(FONT_BOLD)
    .text(" le : ", { continued: true })
    .font(FONT)
    .text(`${validationDate}`);

  doc.moveDown();
}

function initDocument(options = {}) {
  const doc = new PDFDocument({
    layout: "portrait",
    size: "A4",
    margins: {
      top: MARGIN,
      bottom: 30,
      left: 50,
      right: 50,
    },
    ...options,
  });

  doc.registerFont(FONT, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Regular.woff"));
  doc.registerFont(FONT_BOLD, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Bold.woff"));
  doc.registerFont(FONT_ITALIC, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Regular_Italic.woff"));

  return doc;
}

function generateBatchConsentement(outStream, youngs) {
  const random = Math.random();
  console.time("RENDERING " + random);
  const doc = initDocument({ autoFirstPage: false });
  withPipeStream(doc, outStream, () => {
    for (const young of youngs) {
      doc.addPage();
      render(doc, young);
    }
  });
  console.timeEnd("RENDERING " + random);
}

module.exports = { generateBatchConsentement };
