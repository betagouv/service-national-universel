const { differenceInDays, startOfDay } = require("date-fns");
const { capture } = require("../sentry");
const { YoungModel } = require("../models");
const { sendTemplate } = require("../brevo");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, YOUNG_STATUS } = require("snu-lib");

exports.handler = async () => {
  try {
    let countNotice = 0;
    const today = startOfDay(new Date());

    const cursor = await YoungModel.find({
      "correctionRequests.status": "SENT",
      status: YOUNG_STATUS.WAITING_CORRECTION,
    }).cursor();

    if (!cursor) return;

    await cursor.eachAsync(async function (young) {
      try {
        for (const request of young.correctionRequests) {
          const sentAt = startOfDay(new Date(request.sentAt));
          const daysDiff = differenceInDays(today, sentAt);

          if (daysDiff === 3 || daysDiff === 7) {
            countNotice++;
            await sendTemplate(SENDINBLUE_TEMPLATES.young.PHASE_1_WAITING_CORRECTION_REMINDER, {
              emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
            });
          }
        }
      } catch (e) {
        capture(e);
        slack.error({ title: `Inscription reminder day 3 and day 7 - ERROR`, text: JSON.stringify(e) });
      }
    });
    slack.success({ title: `Inscription reminder day 3 and day 7`, text: `${countNotice} jeunes notifiés!` });
  } catch (e) {
    capture(e);
    slack.error({ title: `Inscription reminder day 3 and day 7 - ERROR`, text: JSON.stringify(e) });
    throw e;
  }
};
