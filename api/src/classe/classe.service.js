const { findYoungsByClasseId, generateCertificateByYoung } = require("../young/young.service");
const { generatePdf } = require("../document/document.service");
const { getHtmlTemplate } = require("../templates/utils");
const { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } = require("../young/youngDocument");
const generateCertificatesByClasseId = async (classeId) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);
  if (youngsInClasse.length > 50) {
    throw new Error("TOO_MANY_YOUNGS_IN_CLASSE");
  }
  // TODO : pdf for each young
  const youngPdf = generateCertificateByYoung(youngsInClasse[0]);
  // TODO : create zip from previous pdf files
  return youngPdf;
};

module.exports = {
  generateCertificatesByClasseId,
};
