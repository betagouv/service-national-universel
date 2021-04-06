const cron = require("node-cron");
const { ENVIRONMENT } = require("../config");

const { sendRecapRegion } = require("./mailRecap/cron_hebdo_region");
const { sendRecapDepartmentTuesday, sendRecapDepartmentThursday } = require("./mailRecap/cron_hebdo_department");
const apiEngagement = require("./syncApiEngagement");
const { capture } = require("../sentry");

// dev : */5 * * * * * (every 5 secs)
// prod : 0 8 * * 1 (every monday at 0800)

if (ENVIRONMENT === "production") {
  // every monday at 0800
  cron.schedule("0 8 * * 1", function () {
    capture("START CRON RECAP REGION");
    sendRecapRegion();
  });

  // every tuesday at 0800
  cron.schedule("0 8 * * 2", function () {
    capture("START CRON RECAP DEPARTEMENT");
    sendRecapDepartmentTuesday();
  });

  // every thursday at 0800
  cron.schedule("0 8 * * 4", function () {
    capture("START CRON RECAP DEPARTEMENT");
    sendRecapDepartmentThursday();
  });

  // everyday at 0200
  cron.schedule("0 13 * * *", () => {
    apiEngagement.handler();
  });
}
