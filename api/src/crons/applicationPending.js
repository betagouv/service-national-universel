require("../mongo");
const { capture } = require("../sentry");
const Application = require("../models/application");
const Referent = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ADMIN_URL } = require("../config");
const { differenceInDays } = require("date-fns");

exports.handler = async () => {
  try {
    let countTotal = 0;
    let countHit = 0;
    let countEmailSent = {};
    let countMissionSentCohort = {};
    const now = Date.now();
    const cursor = await Application.find({
      status: "WAITING_VALIDATION",
    }).cursor();
    await cursor.eachAsync(async function (application) {
      countTotal++;
      let patches = await application.patches.find({ ref: application._id, date: { $gte: new Date("2021-11-01").toISOString() } }).sort("-date");
      if (!patches.length) return;
      patches = patches.filter((patch) => patch.ops.filter((op) => op.path === "/status" && op.value === "WAITING_VALIDATION").length > 0);
      if (!patches.length) return;
      const tutor = await Referent.findById(application.tutorId);
      if (!tutor) return;
      if (differenceInDays(now, patches[0].date) >= 7) {
        // send a mail to the tutor
        countHit++;
        //countEmailSent[missions?.length] = (countEmailSent[missions?.length] || 0) + 1;
        // slack.success({
        //   title: "1 week notice pending application",
        //   text: `applicationId: ${application._id} - change status date: ${patches[0].date}, status: WAITING_VALIDATION`,
        // });
        // sendTemplate(SENDINBLUE_TEMPLATES.referent.APPLICATION_REMINDER, {
        //   emailTo: [{ name: `${tutor.firstName} ${tutor.lastName}`, email: tutor.email }],
        //   params: {
        //     cta: `${ADMIN_URL}/dashboard`,
        //     youngFirstName: application.youngFirstName,
        //     youngLastName: application.youngLastName,
        //     missionName: application.missionName,
        //   },
        // });
      }
    });
    slack.info({
      title: "missionApplicationPending",
      text: `${countHit}/${countTotal} (${((countHit / countTotal) * 100).toFixed(
        2,
      )}%) jeunes ciblé(e)s.\nmails envoyés: ${countHit}\nnombre de missions proposées / mail : ${JSON.stringify(
        countEmailSent,
      )}\ncohortes (si missions proposées) : ${JSON.stringify(countMissionSentCohort)}`,
    });
  } catch (e) {
    capture(e);
    slack.error({ title: "applicationPending", text: JSON.stringify(e) });
  }
};
