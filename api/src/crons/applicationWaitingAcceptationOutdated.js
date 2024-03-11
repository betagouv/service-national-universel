const { capture } = require("../sentry");
const slack = require("../slack");
const ApplicationModel = require("../models/application");
const StructureModel = require("../models/structure");
const YoungModel = require("../models/young");
const { SENDINBLUE_TEMPLATES, APPLICATION_STATUS } = require("snu-lib");
const { APP_URL } = require("../config");
const { sendTemplate } = require("../sendinblue");
const { getCcOfYoung } = require("../utils");

const clean = async () => {
  let countAutoCancel = 0;
  let total = 0;
  const now = Date.now();
  const cursor = await ApplicationModel.find({ status: APPLICATION_STATUS.WAITING_ACCEPTATION }).cursor();
  await cursor.eachAsync(async function (application) {
    total++;
    if (diffDays(application.createdAt, now) >= 14) {
      countAutoCancel++;
      application.set({ status: APPLICATION_STATUS.CANCEL });
      await application.save({ fromUser: { firstName: `[CRON] Suppression candidatures en attente J+15` } });
      const young = await YoungModel.findById(application.youngId);
      if (young) {
        const applications = await ApplicationModel.find({ youngId: young._id.toString() });
        young.set({ phase2ApplicationStatus: applications.map((e) => e.status) });
        await young.save({ fromUser: { firstName: `[CRON] Suppression candidatures en attente J+15` } });
      }
    }
  });
  slack.success({ title: "outdated waiting acceptation application", text: `${countAutoCancel}/${total} applications has been archived !` });
};

const notify1Week = async () => {
  let notice1week = 0;
  let total = 0;
  const now = Date.now();
  const cursor = await ApplicationModel.find({ status: APPLICATION_STATUS.WAITING_ACCEPTATION }).cursor();
  await cursor.eachAsync(async function (application) {
    total++;
    if (diffDays(application.createdAt, now) === 7) {
      notice1week++;
      const young = await YoungModel.findById(application.youngId);
      const emailTemplate = SENDINBLUE_TEMPLATES.young.APPLICATION_CANCEL_1_WEEK_NOTICE;
      let cc = getCcOfYoung({ template: emailTemplate, young });
      await sendTemplate(emailTemplate, {
        emailTo: [{ name: `${application?.youngFirstName} ${application?.youngLastName}`, email: application?.youngEmail }],
        params: {
          missionName: application?.missionName,
          cta: `${APP_URL}/mission/${application?.missionId}`,
        },
        cc,
      });
    }
  });
  slack.success({ title: "1 week notice outdated waiting acceptation application", text: `${notice1week}/${total} applications has been noticed !` });
};

const notify13Days = async () => {
  let notice13Days = 0;
  let total = 0;
  const now = Date.now();
  const cursor = await ApplicationModel.find({ status: APPLICATION_STATUS.WAITING_ACCEPTATION }).cursor();
  await cursor.eachAsync(async function (application) {
    total++;
    if (diffDays(application.createdAt, now) === 13) {
      notice13Days++;
      const structure = await StructureModel.findById(application?.structureId);
      const young = await YoungModel.findById(application.youngId);
      const emailTemplate = SENDINBLUE_TEMPLATES.young.APPLICATION_CANCEL_13_DAY_NOTICE;
      let cc = getCcOfYoung({ template: emailTemplate, young });
      await sendTemplate(emailTemplate, {
        emailTo: [{ name: `${application?.youngFirstName} ${application?.youngLastName}`, email: application?.youngEmail }],
        params: {
          missionName: application?.missionName,
          structureName: structure?.name,
          cta: `${APP_URL}/mission/${application?.missionId}`,
        },
        cc,
      });
    }
  });
  slack.success({ title: "13 days notice outdated waiting acceptation application", text: `${notice13Days}/${total} applications has been noticed !` });
};

exports.handler = async () => {
  // slack.info({ title: "outdated waiting acceptation application", text: "I'm checking if there is any outdated outdated waiting acceptation application in our database !" });
  try {
    clean();
  } catch (e) {
    capture(e);
    slack.error({ title: "outdated waiting acceptation application", text: JSON.stringify(e) });
  }
};

exports.handlerNotice1Week = async () => {
  // slack.info({ title: "1 week notice outdated waiting acceptation application", text: "I'm checking if there is any waiting acceptation application in our database that will be expired in 1 week !" });
  try {
    notify1Week();
  } catch (e) {
    capture(e);
    slack.error({ title: "1 week notice outdated waiting acceptation application", text: JSON.stringify(e) });
  }
};

exports.handlerNotice13Days = async () => {
  // slack.info({ title: "1 week notice outdated waiting acceptation application", text: "I'm checking if there is any waiting acceptation application in our database that will be expired in 1 week !" });
  try {
    notify13Days();
  } catch (e) {
    capture(e);
    slack.error({ title: "13 days notice outdated waiting acceptation application", text: JSON.stringify(e) });
  }
};

const diffDays = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
