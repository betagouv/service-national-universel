require("../mongo");
const { capture } = require("../sentry");
const Referent = require("../models/referent");
const slack = require("../slack");

exports.handler = async () => {
  try {
    let count = 0;
    const cursor = await Referent.find({ loginAttempts: { $gt: 0 } }).cursor();
    await cursor.eachAsync(async function (referent) {
      count++;
      referent.set({ loginAttempts: 0 });
      await referent.save();
    });
    count > 0 && slack.success({ title: "loginAttempts", text: `${count} referents ont droits de recommencer à se connecter !` });
  } catch (e) {
    capture(e);
    slack.error({ title: "loginAttempts", text: JSON.stringify(e) });
  }
};
