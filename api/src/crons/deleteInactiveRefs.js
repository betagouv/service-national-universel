require("dotenv").config({ path: "../.env-prod" });
require("../mongo");
const ReferentModel = require("../models/referent");
const MissionModel = require("../models/mission");
const { sendTemplate } = require("../sendinblue");
const { capture } = require("../sentry");
const { ERRORS } = require("../utils");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");

const diffDays = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

async function deleteRef(referent) {
  try {
    const referents = await ReferentModel.find({ structureId: referent.structureId });
    const missionsLinkedToReferent = await MissionModel.find({ tutorId: referent._id }).countDocuments();
    if (referents.length === 1) throw ERRORS.LINKED_STRUCTURE;
    if (missionsLinkedToReferent) throw ERRORS.LINKED_MISSIONS;
    await referent.remove();
  } catch (error) {
    slack.error({ title: `Could not delete referent ${referent._id}:`, text: JSON.stringify(error) });
    capture(error);
  }
}

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
        await deleteRef(ref);
        slack.info({ title: "Referent deleted", text: `Ref ${ref.email} has been deleted` });
      }
    });
  } catch (e) {
    capture(e);
    slack.error({ title: "Delete inactive refs", text: JSON.stringify(e) });
  }
};
