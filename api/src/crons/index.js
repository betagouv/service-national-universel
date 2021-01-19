const cron = require("node-cron");
const YoungModel = require("../models/young");
const { capture } = require("../sentry");

// dev : */5 * * * * * (every 5 secs)

// every day at 4am
cron.schedule("0 4 * * *", function () {
  console.log("START CRON: auto validation");
  autoValidate();
});

const autoValidate = async () => {
  let count = 0;

  const cursor = await YoungModel.find({
    status: "WAITING_VALIDATION",
    cohort: "2021",
  }).cursor();

  await cursor.eachAsync(async (doc) => {
    try {
      console.log("checking", doc.email);

      // check the last item in historic with status WAITING_VALIDATION
      const lastStatus = getLastStatus(doc, "WAITING_VALIDATION");

      // if its createdAt > 2w, then validated by cron
      if (gt2w(lastStatus.createdAt)) {
        console.log("updating", doc.email);
        count++;
        doc.historic.push({ phase: "INSCRIPTION", status: "VALIDATED" });
        doc.set({ status: "VALIDATED", lastStatusAt: Date.now() });
        doc.save();
      }
    } catch (error) {
      capture("e", e);
    }
  });
  capture(`CRON : ${count} validation (2 weeks)`);
};

const getLastStatus = (doc, status) => doc.historic.filter((e) => e.status === status).reverse()[0];

const gt2w = (date) => {
  const date1 = Date.now();
  const date2 = new Date(date);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 14;
};
