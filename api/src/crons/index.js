const cron = require("node-cron");

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

function _log(task, handlers) {
  return async () => {
    console.log(`task started : ${task}`)
    if (handlers instanceof Array) {
      await Promise.all(handlers.map((handler) => handler.call()))
    } else {
      await handlers.call()
    }
    console.log(`task ended : ${task}`)
  }
}

cron.schedule("0 9 * * 1", _log(
  "applicationPending",
  applicationPending.handler
));

cron.schedule("0 15 * * *", _log(
  "deleteCNIAdnSpecificAmenagementType",
  deleteCNIAdnSpecificAmenagementType.handler
));

cron.schedule("0 9 * * 1", _log(
  "noticePushMission",
  noticePushMission.handler
));

// everyday at 0200
cron.schedule(everyHours(6), _log(
  "apiEngagement",
  apiEngagement.handler
));

// everyday at 0200
cron.schedule("0 0 * * *", _log(
  "deleteInactiveRefs",
  deleteInactiveRefs.handler
));

cron.schedule(everyHours(6), _log(
  "jeVeuxAiderDaily",
  jeVeuxAiderDaily.handler
));

cron.schedule("0 6 * * *", _log(
  "contratRelance",
  contratRelance.handler
));

cron.schedule("0 8 * * *", _log("missionOutdated", [
  missionOutdated.handler,
  missionOutdated.handlerNotice1Week
]));

cron.schedule("0 7 * * *", _log("applicationOutaded",  [
  applicationOutaded.handler,
  applicationOutaded.handlerNotice1Week,
  applicationOutaded.handlerNotice13Days
]));

cron.schedule(everyHours(1), _log(
  "computeGoalsInscription",
  computeGoalsInscription.handler
));

cron.schedule("0 1 * * *", _log(
  "loginAttempts",
  loginAttempts.handler
));

cron.schedule("45 2 * * *", _log(
  "syncReferentSupport",
  syncReferentSupport.handler
));

cron.schedule("15 1 * * *", _log(
  "syncContactSupport",
  syncContactSupport.handler
));

cron.schedule("30 1 * * *", _log(
  "structurePatches",
  structurePatches.handler
));

cron.schedule("45 1 * * *", _log(
  "missionEquivalencePatches",
  missionEquivalencePatches.handler
));

cron.schedule("0 2 * * *", _log(
  "missionPatches",
  missionPatches.handler
));

cron.schedule("30 2 * * *", _log(
  "applicationPatches",
  applicationPatches.handler
));

cron.schedule("0 3 * * *", _log(
  "youngPatches",
  youngPatches.handler
));

cron.schedule("20 3 * * *", _log(
  "classePatches",
  classePatches.handler
));

cron.schedule("15 04 * * *", _log(
  "dsnjExport",
  dsnjExport.handler
));

cron.schedule("27 8 * * *", _log(
  "parentConsentementReminder",
  parentConsentementReminder.handler
));

// Every Monday at 7:30am
cron.schedule("30 7 * * 1", _log(
  "parentRevalidateRI",
  parentRevalidateRI.handler
));

// Every day at 11:00
cron.schedule("0 11 * * *", _log(
  "reminderInscription",
  reminderInscription.handler
));

// Every day at 10:00
cron.schedule("0 10 * * *", _log(
  "reminderImageRightsParent2",
  reminderImageRightsParent2.handler
));

cron.schedule("0 5 * * *", _log(
  "refreshMaterializedViews",
  refreshMaterializedViews.handler
));

// tous les jours à 14h00
cron.schedule("2 14 * * *", _log(
  "clotureMissionReminder",
  clotureMissionReminder.handler
));
