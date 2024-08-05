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
// noticePushMission.handler() : Le 1er et le 16 du mois en cours à 9h02
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

function _buildHandler(name, crontab, handlers) {
  return async () => {
    const monitorConfig = {
      schedule: {
        type: "crontab",
        value: crontab,
      },
      timezone: "Etc/UTC",
    };

    const checkInId = captureCheckIn(
      {
        monitorSlug: name,
        status: "in_progress",
      },
      monitorConfig,
    );
    try {
      if (handlers instanceof Array) {
        await Promise.all(handlers.map((handler) => handler.call()));
      } else {
        await handlers.call();
      }
      captureCheckIn(
        {
          checkInId,
          monitorSlug: name,
          status: "ok",
        },
        monitorConfig,
      );
    } catch (e) {
      captureCheckIn(
        {
          checkInId,
          monitorSlug: name,
          status: "error",
        },
        monitorConfig,
      );
    }
  };
}

function _build(name, crontab, handlers) {
  return {
    name,
    crontab,
    handler: _buildHandler(name, crontab, handlers),
  };
}

const CRONS = [
  _build("missionPatches", "0 2 * * *", missionPatches.handler),
  _build("applicationPatches", "30 2 * * *", applicationPatches.handler),
  _build("youngPatches", "0 3 * * *", youngPatches.handler),
  _build("structurePatches", "30 1 * * *", structurePatches.handler),
  _build("missionEquivalencePatches", "45 1 * * *", missionEquivalencePatches.handler),
  _build("classePatches", "20 3 * * *", classePatches.handler),
  _build("dsnjExport", "15 04 * * *", dsnjExport.handler),
  _build("parentConsentementReminder", "27 8 * * *", parentConsentementReminder.handler),
  _build("parentRevalidateRI", "30 7 * * 1", parentRevalidateRI.handler),
  _build("reminderInscription", "0 11 * * *", reminderInscription.handler),
  _build("reminderWaitingCorrection", "2 11 * * *", reminderWaitingCorrection.handler),
  _build("reminderImageRightsParent2", "0 10 * * *", reminderImageRightsParent2.handler),
  _build("refreshMaterializedViews", "0 5 * * *", refreshMaterializedViews.handler),
  _build("clotureMissionReminder", "2 14 * * *", clotureMissionReminder.handler),
  _build("applicationPending", "0 9 * * 1", applicationPending.handler),
  _build("deleteCNIAdnSpecificAmenagementType", "0 15 * * *", deleteCNIAdnSpecificAmenagementType.handler),
  _build("noticePushMission", "2 9 1,16 * *", noticePushMission.handler),
  _build("apiEngagement", "10 */6 * * *", apiEngagement.handler),
  _build("deleteInactiveRefs", "0 0 * * *", deleteInactiveRefs.handler),
  _build("jeVeuxAiderDaily", "7 */6 * * *", jeVeuxAiderDaily.handler),
  _build("contratRelance", "0 6 * * *", contratRelance.handler),
  _build("missionOutdated", "0 8 * * *", [missionOutdated.handler, missionOutdated.handlerNotice1Week]),
  _build("applicationOutaded", "0 7 * * *", [applicationOutaded.handler, applicationOutaded.handlerNotice1Week, applicationOutaded.handlerNotice13Days]),
  _build("computeGoalsInscription", "5 */1 * * *", computeGoalsInscription.handler),
  _build("loginAttempts", "0 1 * * *", loginAttempts.handler),
  _build("syncReferentSupport", "45 2 * * *", syncReferentSupport.handler),
  _build("syncContactSupport", "15 1 * * *", syncContactSupport.handler),
];

module.exports = CRONS;
