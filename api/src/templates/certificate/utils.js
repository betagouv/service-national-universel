const path = require("path");
const config = require("config");
const PDFDocument = require("pdfkit");
const { MINISTRES } = require("snu-lib");

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

const FONT = "Marianne";
const FONT_BOLD = `${FONT}-Bold`;
const FONT_SIZE = 12;
const LINE_GAP = 12;
const FILL_COLOR = "#444";

function initDocument(options = {}) {
  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0, ...options });

  doc.registerFont(FONT, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Regular.woff"));
  doc.registerFont(FONT_BOLD, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Bold.woff"));

  return doc;
}

module.exports = {
  FONT,
  FONT_BOLD,
  FONT_SIZE,
  LINE_GAP,
  FILL_COLOR,
  initDocument,
  getMinistres,
  getCohesionCenterLocation,
};
