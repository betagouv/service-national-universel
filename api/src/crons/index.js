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
const mongoMonitoring = require("./mongoMonitoring");
const monitorCertificats = require("./monitorCertificats");

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
// mongoMonitoring.handler() : toutes les 5 minutes
// monitorCertificats.handler() : toutes les 5 minutes

function cron(name, crontab, handlers) {
  return { name, crontab, handlers: handlers instanceof Array ? handlers : [handlers] };
}

const CRONS = [
  // cron("missionPatches", "0 2 * * *", missionPatches.handler),
  // cron("applicationPatches", "30 2 * * *", applicationPatches.handler),
  // cron("youngPatches", "0 3 * * *", youngPatches.handler),
  // cron("structurePatches", "30 1 * * *", structurePatches.handler),
  // cron("missionEquivalencePatches", "45 1 * * *", missionEquivalencePatches.handler),
  // cron("classePatches", "20 3 * * *", classePatches.handler),
  // cron("dsnjExport", "15 04 * * *", dsnjExport.handler),
  // cron("parentConsentementReminder", "27 8 * * *", parentConsentementReminder.handler),
  // cron("parentRevalidateRI", "30 7 * * 1", parentRevalidateRI.handler),
  // cron("reminderInscription", "0 11 * * *", reminderInscription.handler),
  // cron("reminderWaitingCorrection", "2 11 * * *", reminderWaitingCorrection.handler),
  // cron("reminderImageRightsParent2", "0 10 * * *", reminderImageRightsParent2.handler),
  // cron("refreshMaterializedViews", "0 5 * * *", refreshMaterializedViews.handler),
  // cron("clotureMissionReminder", "2 14 * * *", clotureMissionReminder.handler),
  // cron("applicationPending", "0 9 * * 1", applicationPending.handler),
  // cron("deleteCNIAdnSpecificAmenagementType", "0 15 * * *", deleteCNIAdnSpecificAmenagementType.handler),
  // cron("noticePushMission", "2 9 1,16 * *", noticePushMission.handler),
  // cron("apiEngagement", "10 */6 * * *", apiEngagement.handler),
  // cron("deleteInactiveRefs", "0 0 * * *", deleteInactiveRefs.handler),
  // cron("jeVeuxAiderDaily", "15 */6 * * *", jeVeuxAiderDaily.handler),
  // cron("contratRelance", "0 6 * * *", contratRelance.handler),
  // cron("missionOutdated", "0 8 * * *", [missionOutdated.handler, missionOutdated.handlerNotice1Week]),
  // cron("applicationOutaded", "0 7 * * *", [applicationOutaded.handler, applicationOutaded.handlerNotice1Week, applicationOutaded.handlerNotice13Days]),
  // cron("computeGoalsInscription", "5 */1 * * *", computeGoalsInscription.handler),
  // cron("loginAttempts", "0 1 * * *", loginAttempts.handler),
  // cron("syncReferentSupport", "45 2 * * *", syncReferentSupport.handler),
  // cron("syncContactSupport", "15 1 * * *", syncContactSupport.handler),
  cron("mongoMonitoring", "*/5 * * * *", mongoMonitoring.handler),
  // cron("monitorCertificats", "0 0 1 * *", monitorCertificats.handler),
];

module.exports = CRONS;
