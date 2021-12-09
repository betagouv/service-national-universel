const cron = require("node-cron");
const { ENVIRONMENT } = require("../config");

const mailRecapDepartment = require("./mailRecap/cron_hebdo_department");
const apiEngagement = require("./syncApiEngagement");
const missionOutdated = require("./missionOutdated");
const computeGoalsInscription = require("./computeGoalsInscription");

// dev : */5 * * * * * (every 5 secs)
// prod : 0 8 * * 1 (every monday at 0800)
const EVERY_MINUTE = "* * * * *";
const EVERY_HOUR = "0 * * * *";
const everySeconds = (x) => `*/${x} * * * * *`;
const everyMinutes = (x) => `*/${x} * * * *`;
const everyHours = (x) => `0 */${x} * * *`;

// See: https://www.clever-cloud.com/doc/administrate/cron/#deduplicating-crons (INSTANCE_NUMBER)
if (ENVIRONMENT === "production" && process.env.INSTANCE_NUMBER === "0") {
  // every monday at 0800
  // cron.schedule("0 8 * * 1", function () {
  //   capture("START CRON RECAP REGION");
  //   sendRecapRegion();
  // });

  // every tuesday at 0900
  cron.schedule("0 9 * * 2", function () {
    mailRecapDepartment.handler();
  });

  // every thursday at 0900
  cron.schedule("0 9 * * 4", function () {
    mailRecapDepartment.handler();
  });

  // everyday at 0200
  cron.schedule(everyHours(6), () => {
    apiEngagement.handler();
  });

  //every hour
  // cron.schedule(EVERY_HOUR, () => {
  //   autoAffectationCohesionCenter.handler();
  // });

  // everyday at 02:00 UTC
  cron.schedule("0 8 * * *", () => {
    missionOutdated.handler();
    missionOutdated.handlerNotice1Week();
  });

  cron.schedule(everyHours(1), () => {
    computeGoalsInscription.handler();
  });
}
