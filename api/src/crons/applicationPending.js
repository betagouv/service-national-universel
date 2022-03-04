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
    let countNotice = 0;
    const now = Date.now();
    const cursor = await Application.find({
      status: "WAITING_VALIDATION",
    }).cursor();
    await cursor.eachAsync(async function (application) {
      countNotice++;
      let patches = await application.patches.find({ ref: application._id, date: { $gte: new Date("2021-11-01").toISOString() } }).sort("-date");
      if (!patches.length) return;
      patches = patches.filter((patch) => patch.ops.filter((op) => op.path === "/status" && op.value === "WAITING_VALIDATION").length > 0);
      if (!patches.length) return;
      const tutor = await Referent.findById(application.tutorId);
      if (!tutor) return;
      if (differenceInDays(now, patches[0].date) >= 7) {
        // send a mail to the tutor
        slack.success({
          title: "1 week notice pending application",
          text: `applicationId: ${application._id} - change status date: ${patches[0].date}, status: WAITING_VALIDATION`,
        });
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
    slack.success({ title: "1 week notice pending application 📆", text: `${countNotice} pending application has been noticed !` });
  } catch (e) {
    capture(e);
    slack.error({ title: "applicationPending", text: JSON.stringify(e) });
  }
};
