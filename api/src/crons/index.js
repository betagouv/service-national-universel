const cron = require("node-cron");
const { ENVIRONMENT } = require("../config");

const apiEngagement = require("./syncApiEngagement");
const missionOutdated = require("./missionOutdated");
const computeGoalsInscription = require("./computeGoalsInscription");
const noticePushMission = require("./noticePushMission");
const contratRelance = require("./contratRelance");
const applicationPending = require("./applicationPending");
const jeVeuxAiderDaily = require("./JeVeuxAiderDaily");
const loginAttempts = require("./loginAttempts");
const syncReferentSupport = require("./syncReferentSupport");
const syncContactSupport = require("./syncContactSupport");
const applicationOutaded = require("./applicationWaitingAcceptationOutdated");
const deleteInactiveRefs = require("./deleteInactiveRefs");
const applicationPatches = require("./patch/application");
const missionEquivalencePatches = require("./patch/missionEquivalence");
const missionPatches = require("./patch/mission");
const structurePatches = require("./patch/structure");
const youngPatches = require("./patch/young");
const classePatches = require("./patch/classe");
const refreshMaterializedViews = require("./patch/refresh-materialized-views");
const parentConsentementReminder = require("./parentConsentementReminder");
const parentRevalidateRI = require("./parentRevalidateRI");
const reminderInscription = require("./reminderInscription");
const reminderImageRightsParent2 = require("./reminderImageRightsParent2");
const dsnjExport = require("./dsnjExport");
const clotureMissionReminder = require("./clotureInscriptionReminder");
const deleteCNIAdnSpecificAmenagementType = require("./deleteCNIAndSpecificAmenagementType");

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

// Crons de nuit :
// deleteInactiveRefs.handler() : tous les jours à minuit
// syncReferentSupport.handler() : tous les jours à 2h45
// syncContactSupport.handler() : tous les jours à 1h15
// structurePatches.handler() : tous les jours à 1h30
// missionEquivalencePatches.handler() : tous les jours à 1h45
// missionPatches.handler() : tous les jours à 2h00
// applicationPatches.handler() : tous les jours à 2h30
// youngPatches.handler() : tous les jours à 3h00
// classePatches.handler() : tous les jours à 3h20
// dsnjExport.handler() : tous les jours à 3h30
// refreshMaterializedViews.handler() : tous les jours à 5h00

// Crons qui peuvent être de  jour :
// applicationPending.handler() : tous les lundis à 9h00
// noticePushMission.handler() : tous les lundis à 9h00
// apiEngagement.handler() : toutes les 6 heures
// jeVeuxAiderDaily.handler() : toutes les 6 heures
// contratRelance.handler() : tous les jours à 6h00
// missionOutdated.handler() : tous les jours à 8h00
// applicationOutaded.handler() : tous les jours à 7h00
// computeGoalsInscription.handler() : toutes les heures
// loginAttempts.handler() : tous les jours à 1h00
// parentConsentementReminder.handler() : tous les jours à 8h27
// reminderImageRightsParent2.handler() : tous les jours à 10h00
// clotureMissionReminder.handler() : tous les jours à 14h02

// See: https://www.clever-cloud.com/doc/administrate/cron/#deduplicating-crons (INSTANCE_NUMBER)
if (ENVIRONMENT === "production" && process.env.INSTANCE_NUMBER === "0") {
  cron.schedule("0 9 * * 1", function () {
    applicationPending.handler();
  });

  cron.schedule("0 15 * * *", () => {
    deleteCNIAdnSpecificAmenagementType.handler();
  });

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

  cron.schedule("45 1 * * *", () => {
    missionEquivalencePatches.handler();
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

  cron.schedule("20 3 * * *", () => {
    classePatches.handler();
  });

  cron.schedule("15 04 * * *", () => {
    dsnjExport.handler();
  });

  cron.schedule("27 8 * * *", () => {
    parentConsentementReminder.handler();
  });

  // Every Monday at 7:30am
  cron.schedule("30 7 * * 1", () => {
    parentRevalidateRI.handler();
  });

  // Every day at 11:00
  cron.schedule("0 11 * * *", () => {
    reminderInscription.handler();
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
