const apiEngagement = require("./syncApiEngagement");
const missionOutdated = require("./missionOutdated");
const noticePushMission = require("./noticePushMission");
const contratRelance = require("./contratRelance");
const applicationPending = require("./applicationPending");
const jeVeuxAiderDaily = require("./missionsJVA/JeVeuxAiderDaily");
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
const refreshMaterializedViews = require("./patch/refresh-materialized-views");
const reminderInscription = require("./reminderInscription");
const reminderWaitingCorrection = require("./reminderWaitingCorrection");
const injepExport = require("./injepExport");
const deleteCNIAdnSpecificAmenagementType = require("./deleteCNIAndSpecificAmenagementType");
const monitorCertificats = require("./monitorCertificats");
const checkCoherence = require("./checkCoherence");
const checkMissingInProgressWhenValidated = require("./checkMissingInProgress");
const referentDepartmentOnBoarding = require("./ReferentDepartmentOnBoarding");

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
// injepExport.handler() : tous les jours à 3h40
// refreshMaterializedViews.handler() : tous les jours à 5h00

// Crons qui peuvent être de  jour :
// applicationPending.handler() : tous les lundis à 9h00
// noticePushMission.handler() : Le 1er et le 16 du mois en cours à 9h02
// apiEngagement.handler() : toutes les 6 heures à la 10ème minute
// jeVeuxAiderDaily.handler() : toutes les 6 heures à la 7ème minute
// contratRelance.handler() : tous les jours à 6h00
// missionOutdated.handler() : tous les jours à 8h00
// applicationOutaded.handler() : tous les jours à 7h00
// loginAttempts.handler() : tous les jours à 1h00
// clotureMissionReminder.handler() : tous les jours à 14h02
// monitorCertificats.handler() : 1er jour de chaque mois à 3h00

function cron(name, crontab, handlers) {
  return { name, crontab, handlers: handlers instanceof Array ? handlers : [handlers] };
}

const CRONS = [
  cron("missionPatches", "0 2 * * *", missionPatches.handler),
  cron("applicationPatches", "30 2 * * *", applicationPatches.handler),
  cron("youngPatches", "0 3 * * *", youngPatches.handler),
  cron("structurePatches", "30 1 * * *", structurePatches.handler),
  cron("missionEquivalencePatches", "45 1 * * *", missionEquivalencePatches.handler),
  cron("injepExport", "40 04 * * *", injepExport.handler),
  cron("reminderInscription", "0 11 * * *", reminderInscription.handler),
  cron("reminderWaitingCorrection", "2 11 * * *", reminderWaitingCorrection.handler),
  cron("refreshMaterializedViews", "0 5 * * *", refreshMaterializedViews.handler),
  cron("applicationPending", "0 9 * * 1", applicationPending.handler),
  cron("deleteCNIAdnSpecificAmenagementType", "0 15 * * *", deleteCNIAdnSpecificAmenagementType.handler),
  cron("noticePushMission", "2 9 1,16 * *", noticePushMission.handler),
  cron("apiEngagement", "10 */6 * * *", apiEngagement.handler),
  cron("deleteInactiveRefs", "0 0 * * *", deleteInactiveRefs.handler),
  cron("jeVeuxAiderDaily", "15 */6 * * *", jeVeuxAiderDaily.handler),
  cron("contratRelance", "0 6 * * *", contratRelance.handler),
  cron("missionOutdated", "0 8 * * *", [missionOutdated.handler, missionOutdated.handlerNotice1Week]),
  cron("applicationOutaded", "0 7 * * *", [applicationOutaded.handler, applicationOutaded.handlerNotice1Week, applicationOutaded.handlerNotice13Days]),
  cron("loginAttempts", "0 1 * * *", loginAttempts.handler),
  cron("syncReferentSupport", "45 2 * * *", syncReferentSupport.handler),
  cron("syncContactSupport", "15 1 * * *", syncContactSupport.handler),
  cron("monitorCertificats", "0 3 1 * *", monitorCertificats.handler),
  cron("checkCoherence", "30 7,12,16 * * *", checkCoherence.handler),
  cron("checkMissingInProgressWhenValidated", "42 1 * * *", checkMissingInProgressWhenValidated.handler),
  cron("referentDepartmentOnBoarding", "0 10 * * *", referentDepartmentOnBoarding.handler),
];

module.exports = CRONS;
