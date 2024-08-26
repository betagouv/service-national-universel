/* const path = require("path");
const PDFDocument = require("pdfkit");
const config = require("config"); */

import path from "path";
import PDFDocument from "pdfkit";
import config from "config";

export const FONT = "Marianne";
export const FONT_BOLD = `${FONT}-Bold`;
export const FONT_ITALIC = `${FONT}_Italic`;
export const LIST_INDENT = 15;

export function checkBox(doc, x, y, fillColor, checked = false) {
  const CHECKBOX_SIZE = 15;
  doc.lineWidth(1).fillColor("fff").roundedRect(x, y, CHECKBOX_SIZE, CHECKBOX_SIZE, 2).stroke().fillColor(fillColor);
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
export function getLogo(doc) {
  doc.image(path.join(config.IMAGES_ROOTDIR, "republique-francaise.png"), 0, 0);
  doc.image(path.join(config.IMAGES_ROOTDIR, "logo-snu.png"), 100, 15, { width: 40, height: 40 });
}

export function initDocument(top, bottom, left, right, options = {}) {
  const doc = new PDFDocument({
    layout: "portrait",
    size: "A4",
    margins: {
      top: top,
      bottom: bottom,
      left: left,
      right: right,
    },
    ...options,
  });

  doc.registerFont(FONT, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Regular.woff"));
  doc.registerFont(FONT_BOLD, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Bold.woff"));
  doc.registerFont(FONT_ITALIC, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Regular_Italic.woff"));

  return doc;
}

export function getSignature(doc, _y, city, date) {
  doc
    .font(FONT_BOLD)
    .text("Fait à : ", 50, _y, { continued: true })
    .font(FONT)
    .text(`${city}`, { continued: true })
    .font(FONT_BOLD)
    .text(" le : ", { continued: true })
    .font(FONT)
    .text(`${date}`);
}
