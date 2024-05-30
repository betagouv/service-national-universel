const cron = require("node-cron");
const { instrumentNodeCron } = require("@sentry/node").cron;
const { captureCheckIn } = require("@sentry/node");

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
const reminderWaitingCorrection = require("./reminderWaitingCorrection");
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
// noticePushMission.handler() : tous les lundis à 9h02
// apiEngagement.handler() : toutes les 6 heures à la 10ème minute
// jeVeuxAiderDaily.handler() : toutes les 6 heures à la 7ème minute
// contratRelance.handler() : tous les jours à 6h00
// missionOutdated.handler() : tous les jours à 8h00
// applicationOutaded.handler() : tous les jours à 7h00
// computeGoalsInscription.handler() : toutes les heures à la 5ème minute
// loginAttempts.handler() : tous les jours à 1h00
// parentConsentementReminder.handler() : tous les jours à 8h27
// reminderImageRightsParent2.handler() : tous les jours à 10h00
// clotureMissionReminder.handler() : tous les jours à 14h02

const sentry_cron = instrumentNodeCron(cron);

function _log(task, handlers) {
  return async () => {
    console.log(`task started : ${task}`);
    const checkInId = captureCheckIn({
      monitorSlug: task,
      status: "in_progress",
    });
    try {
      if (handlers instanceof Array) {
        await Promise.all(handlers.map((handler) => handler.call()));
      } else {
        await handlers.call();
      }
      captureCheckIn({
        checkInId,
        monitorSlug: task,
        status: "ok",
      });
    } catch (e) {
      captureCheckIn({
        checkInId,
        monitorSlug: task,
        status: "error",
      });
    }
    console.log(`task ended : ${task}`);
  };
}

function schedule(crontab, name, handlers) {
  sentry_cron.schedule(crontab, _log(name, handlers), { name, recoverMissedExecutions: true, timezone: "Etc/UTC" });
}

function scheduleCrons() {
  schedule("0 2 * * *", "missionPatches", missionPatches.handler);

  schedule("30 2 * * *", "applicationPatches", applicationPatches.handler);

  schedule("0 3 * * *", "youngPatches", youngPatches.handler);

  schedule("30 1 * * *", "structurePatches", structurePatches.handler);

  schedule("45 1 * * *", "missionEquivalencePatches", missionEquivalencePatches.handler);

  schedule("20 3 * * *", "classePatches", classePatches.handler);

  schedule("15 04 * * *", "dsnjExport", dsnjExport.handler);

  schedule("27 8 * * *", "parentConsentementReminder", parentConsentementReminder.handler);

  // Every Monday at 7:30am
  schedule("30 7 * * 1", "parentRevalidateRI", parentRevalidateRI.handler);

  // Every day at 11:00
  schedule("0 11 * * *", "reminderInscription", reminderInscription.handler);

  // Every day at 11:02
  schedule("2 11 * * *", "reminderWaitingCorrection", reminderWaitingCorrection.handler);

  // Every day at 10:00
  schedule("0 10 * * *", "reminderImageRightsParent2", reminderImageRightsParent2.handler);

  schedule("0 5 * * *", "refreshMaterializedViews", refreshMaterializedViews.handler);

  // tous les jours à 14h00
  schedule("2 14 * * *", "clotureMissionReminder", clotureMissionReminder.handler);

  schedule("0 9 * * 1", "applicationPending", applicationPending.handler);

  schedule("0 15 * * *", "deleteCNIAdnSpecificAmenagementType", deleteCNIAdnSpecificAmenagementType.handler);


  schedule("2 9 * * 1", "noticePushMission", noticePushMission.handler);

  // everyday at 0200
  schedule("10 */6 * * *", "apiEngagement", apiEngagement.handler);

  // everyday at 0200
  schedule("0 0 * * *", "deleteInactiveRefs", deleteInactiveRefs.handler);

  schedule("7 */6 * * *", "jeVeuxAiderDaily", jeVeuxAiderDaily.handler);

  schedule("0 6 * * *", "contratRelance", contratRelance.handler);

  schedule("0 8 * * *", "missionOutdated", [missionOutdated.handler, missionOutdated.handlerNotice1Week]);

  schedule("0 7 * * *", "applicationOutaded", [applicationOutaded.handler, applicationOutaded.handlerNotice1Week, applicationOutaded.handlerNotice13Days]);

  schedule("5 */1 * * *", "computeGoalsInscription", computeGoalsInscription.handler);

  schedule("0 1 * * *", "loginAttempts", loginAttempts.handler);

  schedule("45 2 * * *", "syncReferentSupport", syncReferentSupport.handler);

  schedule("15 1 * * *", "syncContactSupport", syncContactSupport.handler);
}

module.exports = {
  scheduleCrons,
};
