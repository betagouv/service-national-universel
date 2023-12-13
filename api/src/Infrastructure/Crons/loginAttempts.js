require("../Databases/Mongo/mongo");
const path = require("path");
const fileName = path.basename(__filename, ".js");
const { capture } = require("../Services/sentry");
const Referent = require("../Databases/Mongo/Models/referent");
const Young = require("../Databases/Mongo/Models/young");
const slack = require("../Services/slack");

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
