const YoungModel = require("../models/young");
const { getHtmlTemplate } = require("../templates/utils");
const { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } = require("./youngDocument");
const { generatePdf } = require("../document/document.service");

const generateCertificateByYoung = async (young) => {
  const youngHtml = await getHtmlTemplate(YOUNG_DOCUMENT.CERTIFICATE, YOUNG_DOCUMENT_PHASE_TEMPLATE.PHASE_1, young);
  return generatePdf(youngHtml);
};

const findYoungsByClasseId = async (classeId) => {
  return YoungModel.find({ classeId });
};

module.exports = {
  generateCertificateByYoung,
  findYoungsByClasseId,
};
