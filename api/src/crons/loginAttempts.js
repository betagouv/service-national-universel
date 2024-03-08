const path = require("path");
const fileName = path.basename(__filename, ".js");
const { capture } = require("../sentry");
const Referent = require("../models/referent");
const Young = require("../models/young");
const slack = require("../slack");

exports.handler = async () => {
  await clean(Referent);
  await clean(Young);
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
  }
};
