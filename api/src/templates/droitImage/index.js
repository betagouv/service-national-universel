const fs = require("fs");
const path = require("path");
const { getBaseUrl, sanitizeAll } = require("../../utils");
const datefns = require("date-fns");

function render(young) {
  const html = readTemplate();
  return renderWithTemplate(young, html);
}

function readTemplate() {
  return fs.readFileSync(path.resolve(__dirname, "./droitImage.html"), "utf8");
}

function renderWithTemplate(young, html) {
  const hasParent2 = young.parent2Status !== undefined && young.parent2Status !== null && young.parent2Status.trim().length > 0;
  const allow = young.parent1AllowImageRights === "true" && (!hasParent2 || young.parent2AllowImageRights === "true");

  return html
    .replace(/{{WITH_2_PARENTS_SPAN}}/g, sanitizeAll(hasParent2 ? "inline":"none"))
    .replace(/{{WITH_1_PARENT_SPAN}}/g, sanitizeAll(hasParent2 ? "none":"inline"))
    .replace(/{{WITH_2_PARENTS_BLOCK}}/g, sanitizeAll(hasParent2 ? "block":"none"))
    .replace(/{{WITH_1_PARENT_BLOCK}}/g, sanitizeAll(hasParent2 ? "none":"block"))
    .replace(/{{WITH_1_PARENT_BLOCK}}/g, sanitizeAll(hasParent2 ? "none":"block"))
    .replace(/{{ALLOW}}/g, sanitizeAll(allow ? "block":"none"))
    .replace(/{{DISALLOW}}/g, sanitizeAll(allow ? "none":"block"))
    .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
    .replace(/{{YOUNG_NAME}}/g, sanitizeAll(young.firstName + " " + young.lastName))
    .replace(/{{PARENT1}}/g, sanitizeAll(young.parent1FirstName + " " + young.parent1LastName))
    .replace(/{{PARENT1_DATE}}/g, sanitizeAll(young.parent1ValidationDate ? datefns.format(young.parent1ValidationDate, "dd/MM/yyyy à HH:mm") : ""))
    .replace(/{{PARENT1_HAS_DATE}}/g, sanitizeAll(young.parent1ValidationDate ? "block":"none"))
    .replace(/{{PARENT2_DATE}}/g, sanitizeAll(young.parent2ValidationDate ? datefns.format(young.parent2ValidationDate, "dd/MM/yyyy à HH:mm") : ""))
    .replace(/{{PARENT2_HAS_DATE}}/g, sanitizeAll(young.parent2ValidationDate ? "block":"none"))
    .replace(/{{PARENT2}}/g, sanitizeAll(young.parent2FirstName + " " + young.parent2LastName));
}

module.exports = { render, readTemplate, renderWithTemplate };
