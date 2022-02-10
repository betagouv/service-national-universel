require("../mongo");

const { capture } = require("../sentry");
const Application = require("../models/application");
const Referent = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ADMIN_URL } = require("../config");

exports.handler = async () => {
  try {
    let countNotice = 0;
    const now = Date.now();
    const cursor = Application.find({
      status: "WAITING_VALIDATION",
      createdAt: { $lt: addDays(now, 8), $gte: addDays(now, 7) },
    }).cursor();
    await cursor.eachAsync(async function (application) {
      countNotice++;
      const tutor = Referent.findById(application.tutorId);
      if (!tutor) return;
      // send a mail to the tutor
      sendTemplate(SENDINBLUE_TEMPLATES.referent.APPLICATION_REMINDER, {
        emailTo: [{ name: `${tutor.firstName} ${tutor.lastName}`, email: tutor.email }],
        params: {
          cta: `${ADMIN_URL}/dashboard`,
          youngFirstName: application.youngFirstName,
          youngLastName: application.youngLastName,
        },
      });
    });
    slack.success({ title: "1 week notice pending application", text: `${countNotice} pending application has been noticed !` });
  } catch (e) {
    capture(e);
    slack.error({ title: "applicationPending", text: JSON.stringify(e) });
  }
};

const addDays = (d, days = 1) => {
  var date = new Date(d);
  date.setDate(date.getDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};
