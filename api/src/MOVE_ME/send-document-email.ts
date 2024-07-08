const { generatePdfIntoBuffer } = require("../utils/pdf-renderer");
const { sendTemplate } = require("../sendinblue");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ERRORS, getCcOfYoung } = require("../utils");
const YoungObject = require("../models/young");
const ContractObject = require("../models/contract");

function getMailParams(type, template, young, contract) {
  if (type === "certificate" && template === "1")
    return {
      object: `Attestation de fin de phase 1 de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation de phase 1 du SNU.`,
    };
  if (type === "certificate" && template === "2")
    return {
      object: `Attestation de fin de phase 2 de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation de phase 2 du SNU.`,
    };
  if (type === "certificate" && template === "3")
    return {
      object: `Attestation de fin de phase 3 de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation de phase 3 du SNU.`,
    };
  if (type === "certificate" && template === "snu")
    return {
      object: `Attestation de réalisation du SNU de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation du SNU.`,
    };
  if (type === "contract" && template === "2" && contract)
    return {
      object: `Contrat de la mission ${contract.missionName}`,
      message: `Vous trouverez en pièce-jointe de ce mail le contract de la mission ${contract.missionName}.`,
    };
  if (type === "convocation" && template === "cohesion") {
    return {
      object: `Convocation au séjour de cohésion de ${young.firstName} ${young.lastName}`,
      message: "Vous trouverez en pièce-jointe de ce mail votre convocation au séjour de cohésion à présenter à votre arrivée au point de rassemblement.",
    };
  }
  throw new Error(ERRORS.NOT_FOUND);
}

async function sendDocumentEmail(opts: { young_id: string; type: string; template: string; fileName: string; switchToCle: boolean; contract_id?: string }) {
  const young = await YoungObject.findById(opts.young_id);

  if (!young) {
    throw new Error(ERRORS.NOT_FOUND);
  }

  let contract = null;
  if (opts.contract_id) {
    contract = await ContractObject.findById(opts.contract_id);
    if (!contract) {
      throw new Error(ERRORS.NOT_FOUND);
    }
  }

  const buffer = await generatePdfIntoBuffer({ type: opts.type, template: opts.template, young, contract });

  const content = buffer.toString("base64");

  const { object, message } = getMailParams(opts.type, opts.template, young, contract);
  let emailTemplate = SENDINBLUE_TEMPLATES.young.DOCUMENT;
  let params = { object, message };

  if (opts.switchToCle) {
    emailTemplate = SENDINBLUE_TEMPLATES.young.PHASE_1_ATTESTATION_SWITCH_CLE;
  }

  const mail = await sendTemplate(emailTemplate, {
    emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
    attachment: [{ content, name: opts.fileName }],
    params,
    cc: getCcOfYoung({ template: emailTemplate, young }),
  });
}

module.exports = {
  sendDocumentEmail,
};
