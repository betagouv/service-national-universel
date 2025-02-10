import { config } from "../config";
import { ApplicationType, SENDINBLUE_TEMPLATES, YoungType } from "snu-lib";
import { getCcOfYoung, getReferentManagerPhase2 } from "../utils";
import { sendTemplate } from "../brevo";
import { ReferentModel, YoungDocument } from "../models";
import { getReferentsPhase2 } from "./applicationService";

export async function notifyReferentMilitaryPreparationFilesSubmitted(user: YoungType) {
  const toReferents = await getReferentManagerPhase2(user.department);
  if (!toReferents) return;
  const emailTo = toReferents.map((referent) => ({ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }));
  const template = SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_SUBMITTED;
  const params = { cta: `${config.ADMIN_URL}/volontaire/${user._id}/phase2`, youngFirstName: user.firstName, youngLastName: user.lastName };
  return await sendTemplate(template, { emailTo, params });
}

export async function notifyReferentNewApplication(application: ApplicationType) {
  const referent = await ReferentModel.findById(application.tutorId);
  if (!referent) return;
  const emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
  const template = SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION_MIG;
  const params = { cta: `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2` };
  return await sendTemplate(template, { emailTo, params });
}

export async function notifySupervisorMilitaryPreparationFilesValidated(application: ApplicationType) {
  const superviseur = await ReferentModel.findById(application.tutorId);
  if (!superviseur) return;
  const emailTo = [{ name: `${superviseur.firstName} ${superviseur.lastName}`, email: superviseur.email }];
  const template = SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED;
  const params = { cta: `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2` };
  return await sendTemplate(template, { emailTo, params });
}

export async function notifyYoungEquivalenceSubmitted(young: YoungType) {
  const template = SENDINBLUE_TEMPLATES.young.EQUIVALENCE_WAITING_VERIFICATION;
  const emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
  const cc = getCcOfYoung({ template, young });
  return await sendTemplate(template, { emailTo, cc });
}

export async function notifyReferentsEquivalenceSubmitted(young: YoungType) {
  if (!young.department) {
    throw new Error(`notifyReferentsEquivalenceSubmitted: young.department is missing for young ${young._id}`);
  }
  const referents = await getReferentsPhase2(young.department);
  const emailTo = referents.map((referent) => ({ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }));
  const template = SENDINBLUE_TEMPLATES.referent.EQUIVALENCE_WAITING_VERIFICATION;
  const params = { cta: `${config.ADMIN_URL}/volontaire/${young._id}/phase2`, youngFirstName: young.firstName, youngLastName: young.lastName };
  return await sendTemplate(template, { emailTo, params });
}

export async function notifyYoungChangementStatutEquivalence(young: YoungDocument, status: string, message: string) {
  const template = SENDINBLUE_TEMPLATES.young[`EQUIVALENCE_${status}`];
  const emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
  const params = { message };
  const cc = getCcOfYoung({ template, young });
  return await sendTemplate(template, { emailTo, params, cc });
}
