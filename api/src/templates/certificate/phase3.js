const path = require("path");
const { initDocument, getMinistres, FONT, FONT_BOLD, FONT_SIZE, LINE_GAP, FILL_COLOR } = require("./utils");
const config = require("config");

function render(doc, young) {
  const d = young.statusPhase3ValidatedAt;
  if (!d) throw "Date de validation de la phase 3 non trouvée";
  const ministresData = getMinistres(d);
  const template = ministresData.template;

  const DATE = d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

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
    .text(`, volontaire à l'édition `, { continued: true })
    .font(FONT_BOLD)
    .text(young.cohort, { continued: true })
    .font(FONT)
    .text(",")
    .text("pour la réalisation de son engagement prolongé")
    .text("validant la ", { continued: true })
    .font(FONT_BOLD)
    .text("phase 3", { continued: true })
    .font(FONT)
    .text(" du Service National Universel.")
    .moveDown()
    .text(`Fait le ${DATE}`);
}

function generateCertifPhase3(outStream, young) {
  const random = Math.random();
  console.time("RENDERING " + random);
  const doc = initDocument();
  doc.pipe(outStream);
  render(doc, young);
  doc.end();
  console.timeEnd("RENDERING " + random);
}

module.exports = { generateCertifPhase3 };
