const { findYoungsByClasseId, generateCertificateForMultipleYoungs } = require("../young/young.service");
const Zip = require("adm-zip");
const generateCertificatesByClasseId = async (classeId) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  if (youngsInClasse.length > 50) {
    throw new Error("TOO_MANY_YOUNGS_IN_CLASSE");
  }
  const youngsPdfs = await generateCertificateForMultipleYoungs(youngsInClasse);

  let zip = new Zip();
  youngsPdfs.forEach((youngPdf) => {
    zip.addFile(`${youngPdf.youngName}.pdf`, youngPdf.buffer);
  });
  return zip.toBuffer();
};

module.exports = {
  generateCertificatesByClasseId,
};
