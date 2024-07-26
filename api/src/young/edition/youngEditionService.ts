import { YOUNG_STATUS, SENDINBLUE_TEMPLATES, canEditYoung } from "snu-lib";
import config from "config";

import { capture } from "../../sentry";
import { sendTemplate } from "../../brevo";
import { ClasseModel } from "../../models";

function generateConsentChanges(value, young) {
  const changes = {};

  const setIfTrue = (condition, field, value) => {
    if (condition) {
      changes[field] = value;
    }
  };

  setIfTrue(value.consent, "status", YOUNG_STATUS.WAITING_VALIDATION);
  setIfTrue(value.consent && young.inscriptionStep2023 === "WAITING_CONSENT", "inscriptionStep2023", "DONE");
  setIfTrue(value.consent && young.reinscriptionStep2023 === "WAITING_CONSENT", "reinscriptionStep2023", "DONE");
  setIfTrue(value.consent, "parentAllowSNU", "true");

  //Parent 1
  setIfTrue(value.consent, "parent1AllowSNU", "true");
  setIfTrue(value.consent, "parent1ValidationDate", new Date());
  setIfTrue(value.imageRights, "parent1AllowImageRights", "true");
  //Parent 2
  setIfTrue(young.parent2Status && value.consent, "parent2AllowSNU", "true");
  setIfTrue(young.parent2Status && value.imageRights, "parent2AllowImageRights", "true");
  setIfTrue(young.parent2Status && value.imageRights, "parent2ValidationDate", new Date());

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
