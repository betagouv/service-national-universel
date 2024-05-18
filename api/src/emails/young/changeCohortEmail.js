const { SENDINBLUE_TEMPLATES, getCohortPeriod, YOUNG_SOURCE } = require("snu-lib");
const CohortModel = require("../../models/cohort");
const ReferentModel = require("../../models/referent");
const { capture } = require("../../sentry");
const { sendTemplate } = require("../../sendinblue");
const config = require("config");

module.exports = (emailsEmitter) => {
  emailsEmitter.on(SENDINBLUE_TEMPLATES.young.CHANGE_COHORT, async ({ young, previousYoung, cohortName, cohortChangeReason, message, classe }) => {
    try {
      if (previousYoung.source === YOUNG_SOURCE.CLE || young.source === YOUNG_SOURCE.CLE) {
        const referentsClasse = await ReferentModel.find({ _id: { $in: classe.referentClasseIds } });
        const emailTo = referentsClasse.map((r) => ({ name: `${r.firstName} ${r.lastName}`, email: r.email }));

        // HTS > CLE
        if (previousYoung.source === YOUNG_SOURCE.VOLONTAIRE && young.source === YOUNG_SOURCE.CLE) {
          await sendTemplate(SENDINBLUE_TEMPLATES.referent.YOUNG_CHANGE_COHORT_HTS_TO_CLE, {
            emailTo,
            params: {
              firstname: young.firstName,
              name: young.lastName,
              class_name: classe.name,
              class_code: classe.uniqueKeyAndId,
              cta: `${config.ADMIN_URL}/classes/${classe._id.toString()}`,
            },
          });
        }

        // CLE > HTS
        if (previousYoung.source === YOUNG_SOURCE.CLE && young.source === YOUNG_SOURCE.VOLONTAIRE) {
          await sendTemplate(SENDINBLUE_TEMPLATES.referent.YOUNG_CHANGE_COHORT_CLE_TO_HTS, {
            emailTo,
            params: {
              firstname: young.firstName,
              name: young.lastName,
              class_name: classe.name,
              class_code: classe.uniqueKeyAndId,
              cta: `${config.ADMIN_URL}/classes/${classe._id.toString()}`,
            },
          });
        }

        // CLE > CLE
        if (previousYoung.source === YOUNG_SOURCE.CLE && young.source === YOUNG_SOURCE.CLE) {
          // TODO: Waiting for the product team to draft the email
        }
      }

      const emailsTo = [];
      if (young.parent1AllowSNU === "true") emailsTo.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email });
      if (young?.parent2AllowSNU === "true") emailsTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
      if (emailsTo.length !== 0) {
        await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT_YOUNG_COHORT_CHANGE, {
          emailTo: emailsTo,
          params: {
            cohort: cohortName,
            youngFirstName: young.firstName,
            youngName: young.lastName,
            cta: `${config.APP_URL}/change-cohort`,
          },
        });
      }

      const cohort = await CohortModel.findOne({ name: cohortName });
      const cohortPeriod = cohort ? getCohortPeriod(cohort) : cohortName;
      const programs = {
        [YOUNG_SOURCE.VOLONTAIRE]: "Volontaire hors temps scolaire (HTS)",
        [YOUNG_SOURCE.CLE]: "Classe engagée (CLE)",
      };

      await sendTemplate(SENDINBLUE_TEMPLATES.young.CHANGE_COHORT, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: {
          cohort: cohortPeriod,
          motif: cohortChangeReason,
          message,
          newcohortdate: cohortPeriod,
          oldprogram: programs[previousYoung.source],
          newprogram: young.source !== previousYoung.source ? programs[young.source] : false,
        },
      });
    } catch (error) {
      capture(error);
    }
  });
};
