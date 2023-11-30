require("../mongo");
const { capture } = require("../sentry");
const YoungModel = require("../models/young");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, YOUNG_STATUS } = require("snu-lib");

exports.handler = async () => {
  try {
    let countNotice = 0;

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    now.setDate(now.getDate() - 3);
    const threeDaysBefore = {
      begin: new Date(now),
      end: new Date(now.setUTCHours(23, 59, 59, 999)),
    };

    now.setDate(now.getDate() - 7);
    now.setUTCHours(0, 0, 0, 0);
    const sevenDaysBefore = {
      begin: new Date(now),
      end: new Date(now.setUTCHours(23, 59, 59, 999)),
    };

    try {
      const cursor = await YoungModel.find({
        $or: [
          {
            status: YOUNG_STATUS.IN_PROGRESS,
            createdAt: { $gte: threeDaysBefore.begin, $lt: threeDaysBefore.end },
          },
          {
            status: YOUNG_STATUS.IN_PROGRESS,
            createdAt: { $gte: sevenDaysBefore.begin, $lt: sevenDaysBefore.end },
          },
        ],
      }).cursor();

      if (!cursor) return;

      await cursor.eachAsync(async function ({ email, firstName, lastName }) {
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
  }
};
