const { capture } = require("../sentry");
const YoungModel = require("../models/young");
const CohortModel = require("../models/cohort");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, YOUNG_STATUS } = require("snu-lib");
const config = require("config");

exports.handler = async () => {
  try {
    let countNotice = 0;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    now.setDate(now.getDate() + 2);
    const twoDaysFromNow = new Date(now);

    now.setDate(now.getDate() + 10);
    const twelveDaysFromNow = new Date(now);

    const sejour = await CohortModel.find({ dateStart: { $in: [twelveDaysFromNow, twoDaysFromNow] } }, { name: 1, dateStart: 1 });
    if (!sejour) return;

    try {
      const cursor = await YoungModel.find({
        cohort: { $in: sejour.map((e) => e.name) },
        status: YOUNG_STATUS.VALIDATED,
        parent1AllowImageRights: "true",
        parent2Email: { $exists: true },
        parent2AllowImageRights: { $exists: false },
      }).cursor();

      if (!cursor) return;

      await cursor.eachAsync(async function (young) {
        countNotice++;
        await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT2_IMAGERIGHT_REMINDER, {
          emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }],
          params: {
            cta: `${config.APP_URL}/representants-legaux/presentation-parent2?token=${young.parent2Inscription2023Token}`,
            youngFirstName: young.firstName,
            youngName: young.lastName,
          },
        });
      });
      slack.success({ title: `Parent 2 image right reminder - ${sejour.name}`, text: `${countNotice} parents have been notified!` });
    } catch (e) {
      capture(e);
      slack.error({ title: `Parent 2 image right reminder - ${sejour.name}`, text: JSON.stringify(e) });
    }
  } catch (e) {
    capture(e);
    slack.error({ title: `Parent 2 image right reminder - ERROR`, text: JSON.stringify(e) });
    throw e;
  }
};
