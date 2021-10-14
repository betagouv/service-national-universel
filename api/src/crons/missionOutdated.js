require("dotenv").config({ path: "./../../.env-staging" });
require("../mongo");
const { capture, captureMessage } = require("../sentry");
const Mission = require("../models/mission");

const clean = async () => {
  let countAutoArchived = 0;
  let countTotal = 0;
  const cursor = await Mission.find({ endAt: { $lt: Date.now() }, status: "VALIDATED" }).cursor();
  await cursor.eachAsync(async function (mission) {
    countTotal++;
    console.log(`${mission._id} ${mission.name} auto archived.`);
    // mission.set({ status: "ARCHIVED" });
    // mission.save();
    countAutoArchived++;

    // notify structure
  });
  captureMessage(`${Date.now()} - ${countAutoArchived} / ${countTotal} missions has been auto archived`);
};

const notify1Week = async () => {
  let countNotice = 0;
  let countTotal = 0;
  const now = Date.now();
  const cursor = await Mission.find({ endAt: { $lte: addDays(now, 7) }, endAt: { $gte: addDays(now, 7) }, status: "VALIDATED" }).cursor();
  await cursor.eachAsync(async function (mission) {
    countTotal++;
    console.log(`${mission._id} ${mission.name} 1 week notice.`);
    countNotice++;

    // notify structure
  });
  captureMessage(`${Date.now()} - ${countNotice} / ${countTotal} missions has been noticed`);
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

exports.handlerNotice1Week = async () => {
  captureMessage(`${Date.now()} - check outdated mission 1 week notice`);
  try {
    notify1Week();
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
  }
};

addDays = (d, days = 1) => {
  var date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
};
