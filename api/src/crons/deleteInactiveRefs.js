require("dotenv").config({ path: "../.env-prod" });
require("../src/mongo");
const ReferentModel = require("../src/models/referent");
const MissionModel = require("../src/models/mission");
const { sendTemplate } = require("../../../../src/sendinblue");
const { capture } = require("../../../sentry");

async function deleteRef(referent) {
  try {
    const referents = await ReferentModel.find({ structureId: referent.structureId });
    const missionsLinkedToReferent = await MissionModel.find({ tutorId: referent._id }).countDocuments();
    if (referents.length === 1) return res.status(409).send({ ok: false, code: ERRORS.LINKED_STRUCTURE });
    if (missionsLinkedToReferent) return res.status(409).send({ ok: false, code: ERRORS.LINKED_MISSIONS });

    await referent.remove();
    console.log(`Referent ${referent._id} has been deleted`);
  } catch (error) {
    capture(error);
  }
}

exports.handler = async () => {
  let date = new Date();
  date = date.setMonth(date.getMonth() - 6);

  const cursor = ReferentModel.find({
    role: { $in: ["referent_department", "referent_region"] },
    $or: [{ lastLoginAt: null }, { lastLoginAt: { $lte: date } }],
  });
  await cursor.eachAsync(async function (ref) {
    try {
      if (ref.lastLoginAt > date.setDate(date.getDate() - 7)) {
        await sendTemplate("1er mail de relance", { name: `${ref.firstName} ${ref.lastName}`, email: ref.email });
      } else if (ref.lastLoginAt > date.setDate(date.getDate() - 14)) {
        await sendTemplate("2eme mail de relance", { name: `${ref.firstName} ${ref.lastName}`, email: ref.email });
      } else {
        const res = await deleteRef(ref);
        sendTemplate("Votre compte a été supprimé", { name: `${ref.firstName} ${ref.lastName}`, email: ref.email });
      }
    } catch (e) {
      console.error("error", ref.email);
      console.error(e);
    }
  });

  console.log("DONE.");
  process.exit(0);
};

// Once every week:

// 1. Get inactive refs. Send mail, set inactiveMail01Sent to current date in ref data

// 2. Get refs with inactiveMail01Sent >= current date:
//  - filter out those that logged in since (set inactiveMail01Sent to null),
//  - send mail 2 to the others, set inactiveMailSent02 to current date

// 3. Get refs with inactiveMail02Sesnt >= current date:
//  - filter out those that logged in since (set inactiveMail02Sent to null)
//  - soft-delete the rest

// V2: Get refs with lastLoginAt >= 6 months ago

// Among them:
// - if lastLoginAt < 6 months + 1 week: send mail #1
// - if lastLoginAt < 6 months + 2 weeks: send mail #2
// - else sodt-delete account, re-allocate structures & missions
