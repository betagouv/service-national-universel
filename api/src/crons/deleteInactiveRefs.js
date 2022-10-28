require("dotenv").config({ path: "../.env-prod" });
require("../src/mongo");
const ReferentModel = require("../src/models/referent");
const MissionModel = require("../src/models/mission");
const { sendTemplate } = require("../../../../src/sendinblue");
const { capture } = require("../../../sentry");
const { ERRORS } = require("../utils");
const slack = require("../slack");

async function deleteRef(referent) {
  try {
    const referents = await ReferentModel.find({ structureId: referent.structureId });
    const missionsLinkedToReferent = await MissionModel.find({ tutorId: referent._id }).countDocuments();
    if (referents.length === 1) throw ERRORS.LINKED_STRUCTURE;
    if (missionsLinkedToReferent) throw ERRORS.LINKED_MISSIONS;

    await referent.remove();
    console.log(`Referent ${referent._id} has been deleted`);
  } catch (error) {
    capture(error);
  }
}

exports.handler = async () => {
  let date = new Date();
  date = date.setMonth(date.getMonth() - 6);

  try {
    let cursor = ReferentModel.find({
      role: { $in: ["referent_department", "referent_region"] },
      $or: [{ lastLoginAt: date }, { lastLoginAt: null, createdAt: date }],
    }).cursor();
    await cursor.eachAsync(async function (ref) {
      await sendTemplate("615", { name: `${ref.firstName} ${ref.lastName}`, email: ref.email });
    });

    cursor = ReferentModel.find({
      role: { $in: ["referent_department", "referent_region"] },
      $or: [{ lastLoginAt: date.setDate(date.getDate() - 7) }, { lastLoginAt: null, createdAt: date.setDate(date.getDate() - 7) }],
    }).cursor();
    await cursor.eachAsync(async function (ref) {
      await sendTemplate("616", { name: `${ref.firstName} ${ref.lastName}`, email: ref.email });
    });

    cursor = ReferentModel.find({
      role: { $in: ["referent_department", "referent_region"] },
      $or: [{ lastLoginAt: { $lte: date.setDate(date.getDate() - 14) } }, { lastLoginAt: null, createdAt: { $lte: date.setDate(date.getDate() - 14) } }],
    }).cursor();
    await cursor.eachAsync(async function (ref) {
      await deleteRef(ref);
      slack.info({ title: "Referent deleted", text: `Ref ${ref.email} has been deleted` });
    });
  } catch (e) {
    console.error(e);
  }

  console.log("DONE.");
  process.exit(0);
};
