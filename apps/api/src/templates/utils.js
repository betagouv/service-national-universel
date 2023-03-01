const certificate = require("./certificate");
const form = require("./form");
const convocation = require("./convocation");
const contractPhase2 = require("./contractPhase2");

async function getHtmlTemplate(type, template, young, contract) {
  if (type === "certificate" && template === "1") return await certificate.phase1(young);
  if (type === "certificate" && template === "2") return certificate.phase2(young);
  if (type === "certificate" && template === "3") return certificate.phase3(young);
  if (type === "certificate" && template === "snu") return certificate.snu(young);
  if (type === "form" && template === "imageRight") return form.imageRight(young);
  if (type === "form" && template === "autotestPCR") return form.autotestPCR(young);
  if (type === "convocation" && template === "cohesion") return convocation.cohesion(young);
  if (type === "contract" && template === "2" && contract) return contractPhase2.render(contract);
}

module.exports = {
  getHtmlTemplate,
};
