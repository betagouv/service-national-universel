import { YOUNG_STATUS, SENDINBLUE_TEMPLATES } from "snu-lib";

import { canEditYoungInScope } from "../youngScope";
import { config } from "../../config";

import { capture } from "../../sentry";
import { sendEmail, sendTemplate } from "../../brevo";
import { ClasseModel } from "../../models";
import { sanitizeAll } from "../../utils";

export function generateConsentChanges(value, young) {
  const changes = {};

  const setIfTrue = (condition, field, value) => {
    if (condition) {
      changes[field] = value;
    }
  };

  setIfTrue(value.consent === true, "status", YOUNG_STATUS.WAITING_VALIDATION);
  setIfTrue(value.consent === false, "status", YOUNG_STATUS.NOT_AUTORISED);
  setIfTrue(value.consent === true && young.inscriptionStep2023 === "WAITING_CONSENT", "inscriptionStep2023", "DONE");
  setIfTrue(value.consent === true && young.reinscriptionStep2023 === "WAITING_CONSENT", "reinscriptionStep2023", "DONE");
  setIfTrue(value.consent === true, "parentAllowSNU", "true");
  setIfTrue(value.consent === false, "parentAllowSNU", "false");

  setIfTrue(value.imageRights === true, "imageRight", "true");
  setIfTrue(value.imageRights === false, "imageRight", "false");

  //Parent 1
  setIfTrue(value.consent === true, "parent1AllowSNU", "true");
  setIfTrue(value.consent === false, "parent1AllowSNU", false);
  //dans tous les cas, on met à jour la date de validation
  setIfTrue(value.consent !== undefined, "parent1ValidationDate", new Date());

  setIfTrue(value.imageRights === true, "parent1AllowImageRights", "true");
  setIfTrue(value.imageRights === false, "parent1AllowImageRights", "false");
  //Parent 2
  setIfTrue(young.parent2Status && value.consent === true, "parent2AllowSNU", "true");
  setIfTrue(young.parent2Status && value.consent === false, "parent2AllowSNU", "false");
  //dans tous les cas, on met à jour la date de validation
  setIfTrue(young.parent2Status && value.consent !== undefined, "parent2ValidationDate", new Date());

  setIfTrue(young.parent2Status && value.imageRights === true, "parent2AllowImageRights", "true");
  setIfTrue(young.parent2Status && value.imageRights === false, "parent2AllowImageRights", "false");

  return changes;
}

export async function canEditYoungConsent(young, user) {
  if (!(await canEditYoungInScope(user, young))) {
    return false;
  }
  const classe = await ClasseModel.findById(young.classeId).populate({
    path: "etablissement",
    options: { select: { coordinateurIds: 1, referentEtablissementIds: 1 } },
  });
  if (!classe || !classe.etablissement) {
    throw new Error(`Etablissement not found for classe ${young.classeId}`);
  }
  //check si le ref est bien lié au jeune
  if (
    !classe.referentClasseIds.includes(user._id) &&
    !classe.etablissement.coordinateurIds.includes(user._id) &&
    !classe.etablissement.referentEtablissementIds.includes(user._id)
  ) {
    return false;
  }

  return true;
}

export async function updateYoungConsent(young, user, updates) {
  const changes = generateConsentChanges(updates, young);

  young.set(changes);
  await young.save({ fromUser: user });

  if (updates.consent) {
    try {
      const emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
      await sendTemplate(SENDINBLUE_TEMPLATES.young.PARENT_CONSENTED, {
        emailTo,
        params: {
          cta: `${config.APP_URL}/`,
          SOURCE: young.source,
        },
      });
    } catch (e) {
      capture(e);
    }
  }
}

/**
 * Changement d'adresse email d'un volontaire à l'initiative d'un référent (constat M73).
 *
 * Contrairement au changement d'adresse en libre-service (`AuthObject.requestEmailUpdate`,
 * api/src/auth.ts), qui exige le mot de passe puis un code envoyé à la nouvelle adresse, la section
 * « identité » du dossier écrit `email` comme n'importe quel autre champ. La correction reste
 * nécessaire au support — un volontaire qui s'est trompé d'adresse ne reçoit plus rien — mais elle
 * ne doit ni passer inaperçue ni laisser survivre les accès associés à l'ancienne adresse :
 * enchaînée avec « mot de passe oublié », elle donne sinon la main sur le compte sans que le
 * titulaire puisse le constater.
 */
export function revokeAccessAfterEmailChange(young) {
  young.set({ lastLogoutAt: Date.now(), forgotPasswordResetToken: "", forgotPasswordResetExpires: null });
}

/** Avertit l'ancienne adresse : c'est le seul signal dont dispose le titulaire du compte. */
export async function notifyPreviousEmailOfChange(young, previousEmail: string) {
  if (!previousEmail) return;
  try {
    await sendEmail(
      { name: `${young.firstName} ${young.lastName}`, email: previousEmail } as any,
      "Votre adresse email a été modifiée",
      `<p>Bonjour ${sanitizeAll(young.firstName)},</p>
       <p>L'adresse email associée à votre compte SNU vient d'être modifiée par un référent : les prochains messages seront envoyés à <b>${sanitizeAll(young.email)}</b>.</p>
       <p>Si vous n'êtes pas à l'origine de cette demande, contactez sans attendre le support depuis <a href="${config.KNOWLEDGEBASE_URL}">${config.KNOWLEDGEBASE_URL}</a>.</p>`,
    );
  } catch (e) {
    capture(e);
  }
}
