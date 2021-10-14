require("dotenv").config({ path: "./../../.env-prod" });
require("../mongo");
const { capture, captureMessage } = require("../sentry");
const Mission = require("../models/mission");
const Referent = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ADMIN_URL } = require("../config");

const clean = async () => {
  let countAutoArchived = 0;
  const cursor = await Mission.find({ endAt: { $lt: Date.now() }, status: "VALIDATED" }).cursor();
  await cursor.eachAsync(async function (mission) {
    countAutoArchived++;
    // console.log(`${mission._id} ${mission.name} auto archived.`);
    // mission.set({ status: "ARCHIVED" });
    // await mission.save();

    // notify structure

    // if (mission.tutorId) {
    //   const responsible = await Referent.findById(mission.tutorId);
    // }
    // if (responsible)
    //   await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_ARCHIVED, {
    //     emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
    //     params: {
    //       missionName: mission.name,
    //       cta: `https://admin.snu.gouv.fr/mission/${mission._id}/youngs`,
    //     },
    //   });
  });
  captureMessage(`${Date.now()} - ${countAutoArchived} missions has been archived`);
};

const notify1Week = async () => {
  let countNotice = 0;
  const now = Date.now();
  const cursor = await Mission.find({ endAt: { $lte: addDays(now, 7), $gte: addDays(now, 7) }, status: "VALIDATED" }).cursor();
  await cursor.eachAsync(async function (mission) {
    countNotice++;
    // console.log(`${mission._id} ${mission.name} : 1 week notice.`);
    // console.log(`${mission._id} ${mission.name} : endAt ${mission.endAt}`);

    // notify structure
    // if (mission.tutorId) {
    //   const responsible = await Referent.findById(mission.tutorId);
    //   if (responsible) tutorFound["oui"] = (tutorFound["oui"] || 0) + 1;
    //   else tutorFound["non"] = (tutorFound["non"] || 0) + 1;
    // }
    // if (responsible)
    //   await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_ARCHIVED_1_WEEK_NOTICE, {
    //     emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
    //     params: {
    //       missionName: mission.name,
    //       ctaMission: `https://admin.snu.gouv.fr/mission/${mission._id}`,
    //       ctaYoungMission: `https://admin.snu.gouv.fr/mission/${mission._id}/youngs`,
    //     },
    //   });
  });
  captureMessage(`${Date.now()} - ${countNotice} missions has been noticed`);
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
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

clean();
