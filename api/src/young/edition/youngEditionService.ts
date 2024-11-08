import { YOUNG_STATUS, SENDINBLUE_TEMPLATES, canEditYoung } from "snu-lib";
import config from "config";

import { capture } from "../../sentry";
import { sendTemplate } from "../../brevo";
import { ClasseModel } from "../../models";

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
  if (!canEditYoung(user, young)) {
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
