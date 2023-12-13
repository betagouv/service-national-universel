require("../../Infrastructure/Databases/Mongo/mongo");
const ReferentModel = require("../../Infrastructure/Databases/Mongo/Models/referent");
const { sendTemplate } = require("../../Infrastructure/Services/sendinblue");
const { capture } = require("../../Infrastructure/Services/sentry");
const slack = require("../../Infrastructure/Services/slack");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");

const diffDays = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

exports.handler = async () => {
  try {
    const now = new Date();
    const sixMonthsAgo = now.setMonth(now.getMonth() - 6);
    const cursor = ReferentModel.find({
      role: { $in: ["referent_department", "referent_region"] },
      $or: [{ lastLoginAt: { $lte: sixMonthsAgo } }, { lastLoginAt: null, createdAt: { $lte: sixMonthsAgo } }],
    }).cursor();
    await cursor.eachAsync(async function (ref) {
      const lastLogin = ref.lastLoginAt === null ? ref.createdAt : ref.lastLoginAt;
      if (diffDays(lastLogin, sixMonthsAgo) === 0) {
        await sendTemplate(SENDINBLUE_TEMPLATES.referent.DELETE_ACCOUNT_NOTIFICATION_1, { name: `${ref.firstName} ${ref.lastName}`, email: ref.email });
      }
      if (diffDays(lastLogin, sixMonthsAgo) === 7) {
        await sendTemplate(SENDINBLUE_TEMPLATES.referent.DELETE_ACCOUNT_NOTIFICATION_2, { name: `${ref.firstName} ${ref.lastName}`, email: ref.email });
      }
      if (diffDays(lastLogin, sixMonthsAgo) >= 14) {
        await ref.remove();
        slack.info({ title: "Referent deleted", text: `Ref ${ref.email} has been deleted` });
      }
    });
  } catch (e) {
    capture(e);
    slack.error({ title: "Delete inactive refs", text: JSON.stringify(e) });
  }
};
