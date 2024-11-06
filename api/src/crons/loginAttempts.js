const path = require("path");
const fileName = path.basename(__filename, ".js");
const { capture } = require("../sentry");
const { ReferentModel, YoungModel } = require("../models");
const slack = require("../slack");

exports.handler = async () => {
  await clean(ReferentModel);
  await clean(YoungModel);
};

const clean = async (model) => {
  try {
    const cursor = await model.find({ loginAttempts: { $gt: 0 } }).cursor();
    await cursor.eachAsync(async function (doc) {
      doc.set({ loginAttempts: 0 });
      await doc.save({ fromUser: { firstName: `Cron ${fileName}` } });
    });
  } catch (e) {
    capture(e);
    slack.error({ title: "loginAttempts", text: JSON.stringify(e) });
    throw e;
  }
};
