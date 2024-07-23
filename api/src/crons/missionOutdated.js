const path = require("path");
const { capture } = require("../sentry");
const Mission = require("../models/mission");
const Referent = require("../models/referent");
const ApplicationObject = require("../models/application");
const YoungObject = require("../models/young");
const { sendTemplate } = require("../brevo");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, APPLICATION_STATUS } = require("snu-lib");
const config = require("config");
const { getCcOfYoung } = require("../utils");
const fileName = path.basename(__filename, ".js");

const clean = async () => {
  let countAutoArchived = 0;
  const cursor = await Mission.find({ endAt: { $lt: Date.now() }, status: "VALIDATED" })
    .cursor()
    .addCursorFlag("noCursorTimeout", true);
  await cursor.eachAsync(async function (mission) {
    countAutoArchived++;
    console.log(`${mission._id} ${mission.name} archived.`);
    mission.set({ status: "ARCHIVED" });
    await mission.save({ fromUser: { firstName: `Cron ${fileName}` } });
    await cancelApplications(mission);

    // notify structure
    if (mission.tutorId) {
      const responsible = await Referent.findById(mission.tutorId);
      if (responsible)
        await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_ARCHIVED, {
          emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
          params: {
            missionName: mission.name,
            cta: `${config.ADMIN_URL}/mission/${mission._id}/youngs`,
          },
        });
    }
  });
  slack.success({ title: "outdated mission", text: `${countAutoArchived} missions has been archived !` });
};

const notify1Week = async () => {
  let countNotice = 0;
  const now = Date.now();
  const cursor = await Mission.find({ endAt: { $lt: addDays(now, 8), $gte: addDays(now, 7) }, status: "VALIDATED" })
    .cursor()
    .addCursorFlag("noCursorTimeout", true);
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
            ctaMission: `${config.ADMIN_URL}/mission/${mission._id}`,
            ctaYoungMission: `${config.ADMIN_URL}/mission/${mission._id}/youngs`,
          },
        });
    }
  });
  slack.success({ title: "1 week notice outdated mission", text: `${countNotice} missions has been noticed !` });
};

const cancelApplications = async (mission) => {
  const applications = await ApplicationObject.find({
    missionId: mission._id,
    status: {
      $in: [
        APPLICATION_STATUS.WAITING_VALIDATION,
        APPLICATION_STATUS.WAITING_ACCEPTATION,
        APPLICATION_STATUS.WAITING_VERIFICATION,
        // todo maybe add other status later.
      ],
    },
  });
  for (let application of applications) {
    let statusComment = "La mission a été archivée.";
    let sendinblueTemplate = SENDINBLUE_TEMPLATES.young.MISSION_ARCHIVED_AUTO;

    application.set({ status: APPLICATION_STATUS.CANCEL, statusComment });
    await application.save({ fromUser: { firstName: `Cron ${fileName}` } });

    const young = await YoungObject.findById(application.youngId);
    if (young) {
      const applications = await ApplicationObject.find({ youngId: young._id.toString() });
      young.set({ phase2ApplicationStatus: applications.map((e) => e.status) });
      await young.save({ fromUser: { firstName: `Cron ${fileName}` } });
    }

    if (sendinblueTemplate) {
      const young = await YoungObject.findById(application.youngId);
      let cc = getCcOfYoung({ template: sendinblueTemplate, young });

      await sendTemplate(sendinblueTemplate, {
        emailTo: [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }],
        params: {
          cta: `${config.APP_URL}/phase2`,
          missionName: mission.name,
          message: mission.statusComment,
        },
        cc,
      });
    }
  }
};

exports.handler = async () => {
  // slack.info({ title: "outdated mission", text: "I'm checking if there is any outdated mission in our database !" });
  try {
    clean();
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
    slack.error({ title: "outdated mission", text: JSON.stringify(e) });
    throw e;
  }
};

exports.handlerNotice1Week = async () => {
  // slack.info({ title: "1 week notice outdated mission", text: "I'm checking if there is any mission in our database that will be expired in 1 week !" });
  try {
    notify1Week();
  } catch (e) {
    capture(e);
    slack.error({ title: "1 week notice outdated mission", text: JSON.stringify(e) });
    throw e;
  }
};

const addDays = (d, days = 1) => {
  var date = new Date(d);
  date.setDate(date.getDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};
