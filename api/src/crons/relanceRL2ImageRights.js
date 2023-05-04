require("dotenv").config({ path: "./../../.env-staging" });
require("../mongo");
const { capture } = require("../sentry");
const YoungModel = require("../models/young");
const CohortModel = require("../models/cohort");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, sessions2023, YOUNG_STATUS } = require("snu-lib");
const { APP_URL } = require("../config");

exports.handler = async () => {
  try {
    let countNotice = 0;
    const now = Date.now();

    const nowPlus2Days = new Date(new Date().setDate(new Date().getDate() + 2))
    const nowPlus12Days = new Date(new Date().setDate(new Date().getDate() + 12))

    const pipeline = [
      {
        $project: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" }
        }
      },
      {
        $match: {
          $or: [
            {
              year: nowPlus12Days.getFullYear(),
              month: nowPlus12Days.getMonth() + 1,
              day: nowPlus12Days.getDate(),
            },
            {
              year: nowPlus2Days.getFullYear(),
              month: nowPlus2Days.getMonth() + 1,
              day: nowPlus2Days.getDate(),
            },
          ]
        }
      },
    ];

    const sejour = await CohortModel.aggregate(pipeline);
    if (!sejour) return;

    const cursor = await YoungModel.find({
      cohort: sejour.name,
      status: YOUNG_STATUS.VALIDATED,
      parent1AllowImageRights: "true",
      parent2Email: { $exists: true },
      parent2AllowImageRights: { $exists: false },
    }).cursor();

    await cursor.eachAsync(async function (young) {
      countNotice++;
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT2_IMAGERIGHT_REMINDER, {
        emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }],
        params: {
          cta: `${APP_URL}/representants-legaux/droits-image?token=${young.parent2Inscription2023Token}`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    });
    slack.success({ title: `Parent 2 image right reminder - ${sejour.name}`, text: `${countNotice} parents have been notified!` });
  } catch (e) {
    capture(e);
    slack.error({ title: `Parent 2 image right reminder - ${sejour.name}`, text: JSON.stringify(e) });
  }
};

const diffDays = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
