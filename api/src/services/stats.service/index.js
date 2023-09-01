const { ROLES } = require("snu-lib");
const { getNewStructures, getYoungNotesPhase2, getYoungPhase2Validated, getMissionsOnTerm, getContractsSigned, getYoungsWhoStartedOrFinishedMissions } = require("./engagement");
const { getYoungNotesPhase1, getTimeScheduleAndPedagoProject, getTransportCorrectionRequests, getSessions, getLineToPoints } = require("./sejour");

const keyNumbersByRole = {
  sejour: {
    [ROLES.REFERENT_DEPARTMENT]: [getYoungNotesPhase1, getTimeScheduleAndPedagoProject],
    [ROLES.REFERENT_REGION]: [getTimeScheduleAndPedagoProject, getTransportCorrectionRequests],
    [ROLES.ADMIN]: [getTransportCorrectionRequests, getSessions, getLineToPoints],
  },
  inscription: {},
  engagement: {
    [ROLES.REFERENT_DEPARTMENT]: [getNewStructures, getYoungNotesPhase2, getMissionsOnTerm, getContractsSigned, getYoungsWhoStartedOrFinishedMissions],
    [ROLES.REFERENT_REGION]: [getYoungPhase2Validated],
    [ROLES.SUPERVISOR]: [getMissionsOnTerm, getYoungsWhoStartedOrFinishedMissions],
    [ROLES.RESPONSIBLE]: [getMissionsOnTerm, getYoungsWhoStartedOrFinishedMissions],
    [ROLES.ADMIN]: [getContractsSigned, getYoungsWhoStartedOrFinishedMissions],
  },
  all: {
    [ROLES.REFERENT_DEPARTMENT]: [
      getYoungNotesPhase1,
      getTimeScheduleAndPedagoProject,
      getNewStructures,
      getYoungNotesPhase2,
      getMissionsOnTerm,
      getContractsSigned,
      getYoungsWhoStartedOrFinishedMissions,
    ],
    [ROLES.REFERENT_REGION]: [getTimeScheduleAndPedagoProject, getTransportCorrectionRequests, getYoungPhase2Validated],
    [ROLES.SUPERVISOR]: [getMissionsOnTerm, getYoungsWhoStartedOrFinishedMissions],
    [ROLES.RESPONSIBLE]: [getMissionsOnTerm, getYoungsWhoStartedOrFinishedMissions],
    [ROLES.ADMIN]: [getTransportCorrectionRequests, getSessions, getLineToPoints, getContractsSigned, getYoungsWhoStartedOrFinishedMissions],
  },
};

/**
 * Get key numbers for a given phase or all of them,
 * for a given period of time and a given user.
 * @param {("sejour"|"inscription"|"engagement"|"all")} phase
 * @param {date} startDate
 * @param {date} endDate
 * @param {object} user
 * @returns {{ id: string, value: number, label: string, icon: string }[]} key numbers
 **/
async function getKeyNumbers(phase, startDate, endDate, user) {
  const functionsToRun = keyNumbersByRole[phase][user.role];
  if (!functionsToRun) return []; // TODO: remove when engagement and inscription are done
  const results = await Promise.all(functionsToRun.map((fn) => fn(startDate, endDate, user)));
  if (!results) return [];
  return results.flat();
}

module.exports = {
  getKeyNumbers,
};
