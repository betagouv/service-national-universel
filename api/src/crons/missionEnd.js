require("../mongo");

const { capture } = require("../sentry");
const Mission = require("../models/mission");
const Referent = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ADMIN_URL } = require("../config");
const { previousMonday } = require("date-fns");

exports.missionEnd = async () => {
  //endAt
  try {
    let countNotice = 0;
    // We want the missions with an end date between last monday and now.
    const cursor = Mission.find({ endAt: { $gte: previousMonday(new Date(Date.now())).toISOString(), $lt: new Date().toISOString() } }).cursor();
    await cursor.eachAsync(async function (mission) {
      countNotice++;
      const tutor = Referent.findById(mission.tutorId);
      if (!tutor) return;
      // send a mail to the tutor
      sendTemplate(SENDINBLUE_TEMPLATES.young.MISSION_END, {
        emailTo: [{ name: `${tutor.firstName} ${tutor.lastName}`, email: tutor.email }],
        params: {
          cta: `${ADMIN_URL}/mission/${mission._id}/youngs`,
        },
      });
    });
    slack.success({ title: "1 week notice mission end", text: `${countNotice} mission end has been noticed !` });
  } catch (e) {
    capture(e);
    slack.error({ title: "missionEnd", text: JSON.stringify(e) });
  }
};
