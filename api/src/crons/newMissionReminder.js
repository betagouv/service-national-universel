require("../mongo");

const { capture } = require("../sentry");
const Mission = require("../models/mission");
const Referent = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, ROLES, SUB_ROLES } = require("snu-lib");
const { ADMIN_URL } = require("../config");

const findReferent = async (mission) => {
  let referent;
  const referents = Referent.find({ role: ROLES.REFERENT_DEPARTMENT, department: mission.department });
  referents.map((ref) => {
    switch (ref.subrole) {
      case SUB_ROLES.manager_phase2:
        referent = ref;
        break;
      case SUB_ROLES.secretariat:
        referent = ref;
        break;
      case SUB_ROLES.manager_department:
        referent = ref;
        break;
      default:
        return;
    }
  });
  if (!referent) return referents;

  return referent;
};

exports.handler = async () => {
  try {
    let countNotice = 0;
    const now = Date.now();
    const cursor = Mission.find({
      status: "WAITING_VALIDATION",
      createdAt: { $lt: addDays(now, 8), $gte: addDays(now, 7) },
    }).cursor();
    await cursor.eachAsync(async function (mission) {
      countNotice++;
      const referent = await findReferent(mission);
      if (referent.length > 0) {
        referent.map((ref) => {
          sendTemplate(SENDINBLUE_TEMPLATES.referent.NEW_MISSION_REMINDER, {
            emailTo: [{ name: `${ref.firstName} ${ref.lastName}`, email: ref.email }],
            params: {
              cta: `${ADMIN_URL}/mission/${mission._id}`,
            },
          });
        });
      } else {
        sendTemplate(SENDINBLUE_TEMPLATES.referent.NEW_MISSION_REMINDER, {
          emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
          params: {
            cta: `${ADMIN_URL}/mission/${mission._id}`,
          },
        });
      }
    });
    slack.success({ title: "1 week notice pending mission", text: `${countNotice} pending mission has been noticed !` });
  } catch (e) {
    capture(e);
    slack.error({ title: "newMissionReminder", text: JSON.stringify(e) });
  }
};

const addDays = (d, days = 1) => {
  var date = new Date(d);
  date.setDate(date.getDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};
