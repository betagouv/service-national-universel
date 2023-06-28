const cron = require("node-cron");
const { ENVIRONMENT } = require("../config");

const apiEngagement = require("./syncApiEngagement");
const missionOutdated = require("./missionOutdated");
const computeGoalsInscription = require("./computeGoalsInscription");
const noticePushMission = require("./noticePushMission");
//const missionEnd = require("./missionEnd");
const contratRelance = require("./contratRelance");
const applicationPending = require("./applicationPending");
//const newMissionReminder = require("./newMissionReminder");
//const syncYoungStatsMetabase = require("./syncYoungStatsMetabase");
const jeVeuxAiderDaily = require("./JeVeuxAiderDaily");
const loginAttempts = require("./loginAttempts");
const syncReferentSupport = require("./syncReferentSupport");
const syncContactSupport = require("./syncContactSupport");
const applicationOutaded = require("./applicationWaitingAcceptationOutdated");
const deleteInactiveRefs = require("./deleteInactiveRefs");
const applicationPatches = require("./patch/application");
const missionPatches = require("./patch/mission");
const structurePatches = require("./patch/structure");
const youngPatches = require("./patch/young");
const refreshMaterializedViews = require("./patch/refresh-materialized-views");
const parentConsentementReminder = require("./parentConsentementReminder");
const reminderImageRightsParent2 = require("./reminderImageRightsParent2");
const dsnjExport = require("./dsnjExport");
const clotureMissionReminder = require("./clotureInscriptionReminder");
const deleteSpecificAmenagementType = require("./deleteSpecificAmenagementType")

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

// See: https://www.clever-cloud.com/doc/administrate/cron/#deduplicating-crons (INSTANCE_NUMBER)
if (ENVIRONMENT === "production" && process.env.INSTANCE_NUMBER === "0") {
  // every monday at 0800
  // cron.schedule("0 8 * * 1", function () {
  //   capture("START CRON RECAP REGION");
  //   sendRecapRegion();
  // });
  // cron.schedule("0 9 * * 1", function () {
  //   newMissionReminder.handler();
  // });

  // everyday at 10:00
  cron.schedule("0 10 * * *", () => {
    deleteSpecificAmenagementType.handler();
  });

  cron.schedule("0 9 * * 1", function () {
    applicationPending.handler();
  });

  // cron.schedule("0 9 * * 1", function () {
  //   missionEnd.handler();
  // });

  // desactivate for now because useless
  // cron.schedule("0 1 * * *", function () {
  //   syncYoungStatsMetabase.handler();
  // });

  cron.schedule("0 9 * * 1", function () {
    noticePushMission.handler();
  });

  // everyday at 0200
  cron.schedule(everyHours(6), () => {
    apiEngagement.handler();
  });

  // everyday at 0200
  cron.schedule("0 0 * * *", () => {
    deleteInactiveRefs.handler();
  });

  cron.schedule(everyHours(6), () => {
    jeVeuxAiderDaily.handler();
  });

  cron.schedule("0 6 * * *", () => {
    contratRelance.handler();
  });

  cron.schedule("0 8 * * *", () => {
    missionOutdated.handler();
    missionOutdated.handlerNotice1Week();
  });

  cron.schedule("0 7 * * *", () => {
    applicationOutaded.handler();
    applicationOutaded.handlerNotice1Week();
    applicationOutaded.handlerNotice13Days();
  });

  cron.schedule(everyHours(1), () => {
    computeGoalsInscription.handler();
  });

  cron.schedule("0 1 * * *", () => {
    loginAttempts.handler();
  });

  cron.schedule("45 2 * * *", () => {
    syncReferentSupport.handler();
  });

  cron.schedule("15 1 * * *", () => {
    syncContactSupport.handler();
  });

  cron.schedule("30 1 * * *", () => {
    structurePatches.handler();
  });

  cron.schedule("0 2 * * *", () => {
    missionPatches.handler();
  });

  cron.schedule("30 2 * * *", () => {
    applicationPatches.handler();
  });

  cron.schedule("0 3 * * *", () => {
    youngPatches.handler();
  });

  cron.schedule("30 03 * * *", () => {
    dsnjExport.handler();
  });

  cron.schedule("27 8 * * *", () => {
    parentConsentementReminder.handler();
  });

  // Every day at 10:00
  cron.schedule("0 10 * * *", () => {
    reminderImageRightsParent2.handler();
  });

  cron.schedule("0 5 * * *", () => {
    refreshMaterializedViews.handler();
  });

  // tous les jours à 14h00
  cron.schedule("2 14 * * *", () => {
    clotureMissionReminder.handler();
  });
}
