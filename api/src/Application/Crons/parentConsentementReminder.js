require("../../Infrastructure/Databases/Mongo/mongo");
const { capture } = require("../../Infrastructure/Services/sentry");
const YoungModel = require("../../Infrastructure/Databases/Mongo/Models/young");
const { sendTemplate } = require("../../Infrastructure/Services/sendinblue");
const slack = require("../../Infrastructure/Services/slack");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { APP_URL } = require("../../Infrastructure/Config/config");

exports.handler = async () => {
  try {
    let countNotice = 0;
    const now = Date.now();
    const cursor = await YoungModel.find({
      cohort: /2023/,
      status: { $in: ["IN_PROGRESS", "REINSCRIPTION"] },
      parent1AllowSNU: { $exists: false },
      inscriptionDoneDate: { $exists: true, $lt: lessDays(now, 7), $gte: lessDays(now, 8) },
    }).cursor();
    await cursor.eachAsync(async function (young) {
      countNotice++;
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT_REMINDER, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${APP_URL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    });
    slack.success({ title: "1 week notice pending parent consentement", text: `${countNotice} parent has been noticed !` });
  } catch (e) {
    capture(e);
    slack.error({ title: "parentConsentementReminder", text: JSON.stringify(e) });
  }
};

const lessDays = (d, days = 1) => {
  var date = new Date(d);
  date.setDate(date.getDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};
