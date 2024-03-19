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

    const threeDaysBefore = new Date(now);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

    const sevenDaysBefore = new Date(now);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);

    const cursor = await YoungModel.find({
      "correctionRequests.status": "SENT",
      status: YOUNG_STATUS.WAITING_CORRECTION,
    }).cursor();

    if (!cursor) return;

    await cursor.eachAsync(async function (young) {
      try {
        for (const request of young.correctionRequests) {
          const sentAt = new Date(request.sentAt);
          if (
            (sentAt >= threeDaysBefore && sentAt < new Date(threeDaysBefore).setDate(threeDaysBefore.getDate() + 1)) ||
            (sentAt >= sevenDaysBefore && sentAt < new Date(sevenDaysBefore).setDate(sevenDaysBefore.getDate() + 1))
          ) {
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
  }
};
