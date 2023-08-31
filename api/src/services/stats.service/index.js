const { ROLES } = require("snu-lib");
const { getYoungNotesPhase1, getTimeSchedule, getTransportCorrectionRequests, getSessions, getLineToPoints } = require("./sejour");
const {
  getNewMissions,
  getNewStructures,
  getYoungNotesPhase2,
  getYoungPhase2Validated,
  getYoungStartPhase2InTime,
  getApplicationsChangeStatus,
  getYoungsWhoStartedOrFinishedMissions,
  getMissionsChangeStatus,
  getProposedMissionsAcceptedOrRefusedByYoung,
  getMissionsOnTerm,
  getContractsSigned,
} = require("./engagement");

const keyNumbersByRole = {
  sejour: {
    [ROLES.REFERENT_DEPARTMENT]: [getYoungNotesPhase1, getTimeSchedule],
    [ROLES.REFERENT_REGION]: [getTimeSchedule, getTransportCorrectionRequests],
    [ROLES.ADMIN]: [getTransportCorrectionRequests, getSessions, getLineToPoints],
  },
  inscription: {},
  engagement: {
    [ROLES.REFERENT_DEPARTMENT]: [
      getNewMissions,
      getNewStructures,
      getYoungNotesPhase2,
      getYoungsWhoStartedOrFinishedMissions,
      getMissionsChangeStatus,
      getProposedMissionsAcceptedOrRefusedByYoung,
      getApplicationsChangeStatus,
      getMissionsOnTerm,
      getContractsSigned,
    ],
    [ROLES.REFERENT_REGION]: [getYoungPhase2Validated, getYoungStartPhase2InTime],
    [ROLES.RESPONSIBLE]: [getApplicationsChangeStatus, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus, getMissionsOnTerm],
    [ROLES.SUPERVISOR]: [getApplicationsChangeStatus, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus, getMissionsOnTerm],
    [ROLES.ADMIN]: [getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus, getApplicationsChangeStatus, getContractsSigned],
  },
  all: {
    [ROLES.REFERENT_DEPARTMENT]: [
      getYoungNotesPhase1,
      //getTimeSchedule,
      getNewMissions,
      getNewStructures,
      getYoungNotesPhase2,
      getYoungsWhoStartedOrFinishedMissions,
      getMissionsChangeStatus,
      getProposedMissionsAcceptedOrRefusedByYoung,
      getApplicationsChangeStatus,
      getMissionsOnTerm,
      getContractsSigned,
    ],
    [ROLES.REFERENT_REGION]: [getTimeSchedule, getTransportCorrectionRequests, getYoungPhase2Validated, getYoungStartPhase2InTime],
    [ROLES.ADMIN]: [
      getTransportCorrectionRequests,
      getSessions,
      getLineToPoints,
      getYoungsWhoStartedOrFinishedMissions,
      getMissionsChangeStatus,
      getApplicationsChangeStatus,
      getContractsSigned,
    ],
    [ROLES.RESPONSIBLE]: [getApplicationsChangeStatus, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus, getMissionsOnTerm],
    [ROLES.SUPERVISOR]: [getApplicationsChangeStatus, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus, getMissionsOnTerm],
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
