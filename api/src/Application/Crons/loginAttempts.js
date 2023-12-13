require("../../Infrastructure/Databases/Mongo/mongo");
const path = require("path");
const fileName = path.basename(__filename, ".js");
const { capture } = require("../../Infrastructure/Services/sentry");
const Referent = require("../../Infrastructure/Databases/Mongo/Models/referent");
const Young = require("../../Infrastructure/Databases/Mongo/Models/young");
const slack = require("../../Infrastructure/Services/slack");

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
