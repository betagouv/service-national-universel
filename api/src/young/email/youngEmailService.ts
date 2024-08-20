import config from "config";
import { SENDINBLUE_TEMPLATES } from "snu-lib";
import { sendTemplate } from "../../brevo";
import { getCcOfYoung } from "../../utils";

interface EmailParams {
  cta?: string;
  message?: string;
  missionName?: string;
  structureName?: string;
  type_document?: string;
  object?: string;
  link?: string;
}

export async function sendEmailToYoung(template: string, young, params: EmailParams = {}) {
  const { cta, message, missionName, structureName, type_document, object, link } = params;
  let buttonCta = cta || config.APP_URL;
  if (template === SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_CORRECTION) buttonCta = `${config.APP_URL}/ma-preparation-militaire`;
  if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED)
    buttonCta = `${config.APP_URL}/inscription/coordonnees?utm_campaign=transactionnel+compte+cree&utm_source=notifauto&utm_medium=mail+219+acceder`;
  if (template === SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION)
    buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+nouvelles+mig+proposees&utm_source=notifauto&utm_medium=mail+170+acceder`;
  if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_REACTIVATED)
    buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+compte+reactive&utm_source=notifauto&utm_medium=mail+168+seconnecter`;
  if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED)
    buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+inscription+validee&utm_source=notifauto&utm_medium=mail+167+seconnecter`;
  if (buttonCta === SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_CORRECTION)
    buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+dossier+attente+correction&utm_source=notifauto&utm_medium=mail+169+corriger`;

  if (Object.values(SENDINBLUE_TEMPLATES.young).includes(template)) {
    let cc = getCcOfYoung({ template, young });
    await sendTemplate(template, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      params: { firstName: young.firstName, lastName: young.lastName, cta: buttonCta, message, missionName, structureName, type_document, object, link },
      cc,
    });
  }

  if (Object.values(SENDINBLUE_TEMPLATES.parent).includes(template)) {
    await sendTemplate(template, {
      emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
      params: { youngFirstName: young.firstName, youngLastName: young.lastName, cta: buttonCta, message, missionName, structureName, type_document, object, link },
    });
  }
}
