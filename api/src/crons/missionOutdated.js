require("dotenv").config({ path: "./../../.env-staging" });

require("../mongo");
const { capture, captureMessage } = require("../sentry");
const Mission = require("../models/mission");

const clean = async () => {
  let countAutoArchived = 0;
  const missionLimit = await Mission.find({ endAt: { $lt: Date.now() }, status: "VALIDATED" });
  captureMessage(`${Date.now()} - ${missionLimit.length} missions has endAt reached`);
  for (let i = 0; i < missionLimit.length; i++) {
    const mission = missionLimit[i];
    console.log(`${mission._id} ${mission.name} auto archived.`);
    // mission.set({ status: "ARCHIVED" });
    // await mission.save();
    countAutoArchived++;
  }
  captureMessage(`${Date.now()} - ${countAutoArchived} missions has been auto archived`);
};

exports.handler = async () => {
  captureMessage(`${Date.now()} - check outdated mission`);
  try {
    clean();
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
  }
};
