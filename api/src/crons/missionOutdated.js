require("dotenv").config({ path: "./../../.env-staging" });
require("../mongo");
const { capture } = require("../sentry");
const Mission = require("../models/mission");
const Referent = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ADMIN_URL } = require("../config");

const clean = async () => {
  let countAutoArchived = 0;
  const cursor = await Mission.find({ endAt: { $lt: Date.now() }, status: "VALIDATED" }).cursor();
  await cursor.eachAsync(async function (mission) {
    countAutoArchived++;
    console.log(`${mission._id} ${mission.name} archived.`);
    mission.set({ status: "ARCHIVED" });
    await mission.save();

    // notify structure
    if (mission.tutorId) {
      const responsible = await Referent.findById(mission.tutorId);
      if (responsible)
        await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_ARCHIVED, {
          emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
          params: {
            missionName: mission.name,
            cta: `${ADMIN_URL}/mission/${mission._id}/youngs`,
          },
        });
    }
  });
  slack.success({ title: "outdated mission", text: `${countAutoArchived} missions has been archived !` });
};

const notify1Week = async () => {
  let countNotice = 0;
  const now = Date.now();
  const cursor = await Mission.find({ endAt: { $lt: addDays(now, 8), $gte: addDays(now, 7) }, status: "VALIDATED" }).cursor();
  await cursor.eachAsync(async function (mission) {
    countNotice++;
    console.log(`${mission._id} ${mission.name} : 1 week notice.`);
    console.log(`${mission._id} ${mission.name} : endAt ${mission.endAt}`);

    // notify structure
    if (mission.tutorId) {
      const responsible = await Referent.findById(mission.tutorId);
      if (responsible)
        await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_ARCHIVED_1_WEEK_NOTICE, {
          emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
          params: {
            missionName: mission.name,
            ctaMission: `${ADMIN_URL}/mission/${mission._id}`,
            ctaYoungMission: `${ADMIN_URL}/mission/${mission._id}/youngs`,
          },
        });
    }
  });
  slack.success({ title: "1 week notice outdated mission", text: `${countNotice} missions has been noticed !` });
};

exports.handler = async () => {
  // slack.info({ title: "outdated mission", text: "I'm checking if there is any outdated mission in our database !" });
  try {
    clean();
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
    slack.error({ title: "outdated mission", text: "An error occured 😢" });
  }
};

exports.handlerNotice1Week = async () => {
  // slack.info({ title: "1 week notice outdated mission", text: "I'm checking if there is any mission in our database that will be expired in 1 week !" });
  try {
    notify1Week();
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
    slack.error({ title: "1 week notice outdated mission", text: "An error occured 😢" });
  }
};

const addDays = (d, days = 1) => {
  var date = new Date(d);
  date.setDate(date.getDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};
