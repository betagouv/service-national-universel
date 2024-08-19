import { SENDINBLUE_TEMPLATES } from "snu-lib";
import { YoungDto } from "snu-lib";
import { ContractDto } from "snu-lib";

import { generatePdfIntoBuffer } from "../utils/pdf-renderer";
import { sendTemplate } from "../brevo";
import { ERRORS, getCcOfYoung } from "../utils";
import { YoungModel, ContractModel } from "../models";

function getMailParams(type: string, template: string, young: YoungDto, contract?: ContractDto | null) {
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

export interface SendDocumentEmailOptions {
  young_id: string;
  type: string;
  template: string;
  fileName: string;
  switchToCle: boolean;
  contract_id?: string;
}

export async function sendDocumentEmail(options: SendDocumentEmailOptions) {
  const young: YoungDto | null = await YoungModel.findById(options.young_id);

  if (!young) {
    throw new Error(ERRORS.NOT_FOUND);
  }

  let contract: ContractDto | null = null;
  if (options.contract_id) {
    contract = await ContractModel.findById(options.contract_id);
    if (!contract) {
      throw new Error(ERRORS.NOT_FOUND);
    }
  }

  const buffer = await generatePdfIntoBuffer({ type: options.type, template: options.template, young, contract });

  const content = buffer.toString("base64");

  const { object, message } = getMailParams(options.type, options.template, young, contract);
  let emailTemplate = SENDINBLUE_TEMPLATES.young.DOCUMENT;
  let params = { object, message };

  if (options.switchToCle) {
    emailTemplate = SENDINBLUE_TEMPLATES.young.PHASE_1_ATTESTATION_SWITCH_CLE;
  }

  await sendTemplate(emailTemplate, {
    emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email! }],
    attachment: [{ content, name: options.fileName }],
    params,
    cc: getCcOfYoung({ template: emailTemplate, young }),
  });
}
