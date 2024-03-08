const { capture } = require("../sentry");
const YoungModel = require("../models/young");
const CohortModel = require("../models/cohort");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, REGLEMENT_INTERIEUR_VERSION } = require("snu-lib");
const { APP_URL } = require("../config");

exports.handler = async () => {
  try {
    let countNotice = 0;
    const newRiDate = new Date(REGLEMENT_INTERIEUR_VERSION);
    const cohortCollection = await CohortModel.find({
      dateStart: { $gte: newRiDate },
    });
    const cohorts = cohortCollection.map(({ name }) => name);
    const cursor = await YoungModel.find({
      cohort: cohorts,
      parent1ValidationDate: { $lt: newRiDate },
    }).cursor();
    await cursor.eachAsync(async function (young) {
      countNotice++;
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_REVALIDATE_RI, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${APP_URL}/representants-legaux/ri-consentement?token=${young.parent1Inscription2023Token}`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    });
    slack.success({ title: "1 week notice pending parent RI validation", text: `${countNotice} parent has been noticed !` });
  } catch (e) {
    capture(e);
    slack.error({ title: "parentRevalidateRI", text: JSON.stringify(e) });
  }
};
