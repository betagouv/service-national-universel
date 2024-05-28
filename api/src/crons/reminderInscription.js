const { capture } = require("../sentry");
const YoungModel = require("../models/young");
const CohortModel = require("../models/cohort");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, YOUNG_STATUS } = require("snu-lib");
const { startOfDay, subDays, endOfDay } = require("date-fns");

exports.handler = async () => {
  try {
    let countNotice = 0;

    const today = startOfDay(new Date());

    const threeDaysBefore = subDays(today, 3);
    const sevenDaysBefore = subDays(today, 7);

    try {
      const cohorts = await CohortModel.find({ name: /2024/ });
      const cursor = await YoungModel.find({
        $or: [
          {
            status: YOUNG_STATUS.IN_PROGRESS,
            createdAt: { $gte: threeDaysBefore, $lt: endOfDay(threeDaysBefore) },
          },
          {
            status: YOUNG_STATUS.IN_PROGRESS,
            createdAt: { $gte: sevenDaysBefore, $lt: endOfDay(sevenDaysBefore) },
          },
        ],
      }).cursor();

      if (!cursor) return;

      await cursor.eachAsync(async function ({ email, firstName, lastName, cohort }) {
        const matchCohort = cohorts.find((c) => c.name === cohort);
        if (!matchCohort) return;
        if (matchCohort.inscriptionEndDate < new Date()) return;

        countNotice++;
        await sendTemplate(SENDINBLUE_TEMPLATES.young.INSCRIPTION_REMINDER, {
          emailTo: [{ name: `${firstName} ${lastName}`, email }],
        });
      });
      slack.success({ title: `Inscription reminder day 3 and day 7`, text: `${countNotice} youngs have been notified!` });
    } catch (e) {
      capture(e);
      slack.error({ title: `Inscription reminder day 3 and day 7`, text: JSON.stringify(e) });
    }
  } catch (e) {
    capture(e);
    slack.error({ title: `Inscription reminder day 3 and day 7 - ERROR`, text: JSON.stringify(e) });
    throw e;
  }
};
