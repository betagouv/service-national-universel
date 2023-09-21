require("dotenv").config();
const cron = require("node-cron");

const { ENVIRONMENT } = require("../config");
const addJdmaData = require("./add-jdma-data.job");
const addUptimeRobotData = require("./add-uptime-robot-data.job");
const addCodeClimateData = require("./add-code-climate-data.job");
const addSentryData = require("./add-sentry-data.job");

// doubt ? -> https://crontab.guru/

/* eslint-disable no-unused-vars */
// dev : */5 * * * * * (every 5 secs)
// prod : 0 8 * * 1 (every monday at 0800)
const EVERY_MINUTE = "* * * * *";
const EVERY_HOUR = "0 * * * *";
const everySeconds = (x) => `*/${x} * * * * *`;
const everyMinutes = (x) => `*/${x} * * * *`;
const everyHours = (x) => `0 */${x} * * *`;
/* eslint-enable no-unused-vars */

// ! A jour du 16 juin 2023 (Source ChatGPT)
// Voici les heures de déclenchement de chaque cron dans le fichier fourni (en UTC):

// applicationPending.handler() : tous les jours à 2h00

// See: https://www.clever-cloud.com/doc/administrate/cron/#deduplicating-crons (INSTANCE_NUMBER)
if (ENVIRONMENT === "production" && process.env.INSTANCE_NUMBER === "0") {
  // Every day at 02:00
  cron.schedule("0 2 * * *", () => {
    addJdmaData.handler();
  });
  // Every day at 02:10
  cron.schedule("10 2 * * *", () => {
    addCodeClimateData.handler();
  });
  // Every day at 02:20
  cron.schedule("20 2 * * *", () => {
    addUptimeRobotData.handler();
  });
  // Every day at 02:30
  cron.schedule("30 2 * * *", () => {
    addSentryData.handler();
  });
}
