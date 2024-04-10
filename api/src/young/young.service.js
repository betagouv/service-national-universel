const YoungModel = require("../models/young");
const { getHtmlTemplate } = require("../templates/utils");
const { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } = require("./youngDocument");
const { generatePdf } = require("../document/document.service");

const buildUniqueName = (young) => `${young.firstName}-${young.lastName}-${young._id}`;

const generateCertificateByYoung = async (young) => {
  const youngHtml = await getHtmlTemplate(YOUNG_DOCUMENT.CERTIFICATE, YOUNG_DOCUMENT_PHASE_TEMPLATE.PHASE_1, young);
  return { buffer: await generatePdf(youngHtml), youngName: buildUniqueName(young) };
};

const generateCertificateForMultipleYoungs = async (youngs) => {
  const youngPdfPromises = await youngs.map(async (young) => {
    return await generateCertificateByYoung(young);
  });
  return Promise.all(youngPdfPromises);
};

const findYoungsByClasseId = async (classeId) => {
  return YoungModel.find({ classeId });
};

module.exports = {
  generateCertificateByYoung,
  findYoungsByClasseId,
  generateCertificateForMultipleYoungs,
  buildUniqueName,
};
