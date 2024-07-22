const { capture } = require("../sentry");
const Application = require("../models/application");
const Referent = require("../models/referent");
const { sendTemplate } = require("../brevo");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const config = require("config");
const { differenceInDays, getMonth } = require("date-fns");

exports.handler = async () => {
  try {
    let countTotal = 0;
    let countHit = 0;
    let countApplicationMonth = {};
    const tutors = [];
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
      if (!application.tutorId) return;
      const tutor = await Referent.findById(application.tutorId);
      if (!tutor) return;
      if (differenceInDays(now, patches[0].date) >= 7) {
        // send a mail to the tutor
        countHit++;
        countApplicationMonth[getMonth(new Date(patches[0].date)) + 1] = (countApplicationMonth[getMonth(new Date(patches[0].date)) + 1] || 0) + 1;
        if (!tutors.includes(tutor.email)) tutors.push(tutor.email);

        await sendTemplate(SENDINBLUE_TEMPLATES.referent.APPLICATION_REMINDER, {
          emailTo: [{ name: `${tutor.firstName} ${tutor.lastName}`, email: tutor.email }],
          params: {
            cta: `${config.ADMIN_URL}/volontaire/${application.youngId}`,
            youngFirstName: application.youngFirstName,
            youngLastName: application.youngLastName,
            missionName: application.missionName,
          },
        });
      }
    });
    slack.info({
      title: "missionApplicationPending",
      text: `${countHit}/${countTotal} (${((countHit / countTotal) * 100).toFixed(
        2,
      )}%) candidatures ciblées.\nmails envoyés: ${countHit}\ncandidatures ciblées/mois : ${JSON.stringify(countApplicationMonth)}\ntuteurs notifiés : ${
        tutors.length
      }\nmoyenne mails/tuteur : ${countHit / tutors.length}`,
    });
  } catch (e) {
    capture(e);
    slack.error({ title: "applicationPending", text: JSON.stringify(e) });
    throw e;
  }
};
