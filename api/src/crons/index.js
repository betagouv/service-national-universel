const cron = require("node-cron");
const { ENVIRONMENT } = require("../config");

const { sendRecapRegion } = require("./mailRecap/cron_hebdo_region");
const { sendRecapDepartmentTuesday, sendRecapDepartmentThursday } = require("./mailRecap/cron_hebdo_department");
const apiEngagement = require("./syncApiEngagement");
const { capture } = require("../sentry");
const autoAffectationCohesionCenter = require("./autoAffectationCohesionCenter");
const missionOutdated = require("./missionOutdated");

// dev : */5 * * * * * (every 5 secs)
// prod : 0 8 * * 1 (every monday at 0800)
const EVERY_MINUTE = "* * * * *";
const EVERY_HOUR = "0 * * * *";
const everySeconds = (x) => `*/${x} * * * * *`;

// See: https://www.clever-cloud.com/doc/administrate/cron/#deduplicating-crons (INSTANCE_NUMBER)
if (ENVIRONMENT === "production" && process.env.INSTANCE_NUMBER === "0") {
  // every monday at 0800
  // cron.schedule("0 8 * * 1", function () {
  //   capture("START CRON RECAP REGION");
  //   sendRecapRegion();
  // });

  // every tuesday at 0800
  // cron.schedule("0 8 * * 2", function () {
  //   capture("START CRON RECAP DEPARTEMENT");
  //   sendRecapDepartmentTuesday();
  // });

  // every thursday at 0800
  // cron.schedule("0 8 * * 4", function () {
  //   capture("START CRON RECAP DEPARTEMENT");
  //   sendRecapDepartmentThursday();
  // });

  // everyday at 0200
  cron.schedule("0 13 * * *", () => {
    apiEngagement.handler();
  });

  //every hour
  // cron.schedule(EVERY_HOUR, () => {
  //   autoAffectationCohesionCenter.handler();
  // });

  // everyday at 02:00 UTC
  // cron.schedule(EVERY_MINUTE, () => {
  //   missionOutdated.handler();
  //   missionOutdated.handlerNotice1Week();
  // });
}
