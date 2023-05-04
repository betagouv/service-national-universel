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

    const sejour = await CohortModel.findOne(
      {
        dateStart: {
          $or: [
            {
              $gte: new Date(new Date().setDate(new Date().getDate() + 1)),
              $lte: new Date(new Date().setDate(new Date().getDate() + 2))
            },
            {
              $gte: new Date(new Date().setDate(new Date().getDate() + 11)),
              $lte: new Date(new Date().setDate(new Date().getDate() + 12))
            },
          ],
        }
      },
      {
        name: 1,
        dateStart: 1
      }
    );

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
