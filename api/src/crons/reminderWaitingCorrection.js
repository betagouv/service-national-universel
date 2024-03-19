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

    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const cursor = await YoungModel.find({
      correctionRequests: {
        $elemMatch: {
          status: "SENT",
          sentAt: {
            $gte: sevenDaysAgo,
            $lte: threeDaysAgo,
          },
        },
      },
      status: YOUNG_STATUS.WAITING_CORRECTION,
    }).cursor();

    if (!cursor) return;

    await cursor.eachAsync(async function (young) {
      try {
        for (const request of young.correctionRequests) {
          const sentAt = new Date(request.sentAt);
          // On compare les jours sans les heures pour faire au plus juste
          if (sentAt.toISOString().split("T")[0] === threeDaysAgo.toISOString().split("T")[0] || sentAt.toISOString().split("T")[0] === sevenDaysAgo.toISOString().split("T")[0]) {
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
