const { ROLES } = require("snu-lib");
const {
  getNewStructures,
  getYoungNotesPhase2,
  getYoungPhase2Validated,
  getMissionsOnTerm,
  getContractsSigned,
  getYoungsWhoStartedOrFinishedMissions,
  getMissionsChangeStatus,
} = require("./engagement");
const { getYoungNotesPhase1, getTimeScheduleAndPedagoProject, getTransportCorrectionRequests, getSessions, getLineToPoints } = require("./sejour");
const {
  getYoungNotesPhase0,
  getYoungRegisteredWithParticularSituation,
  getDepartmentRegistrationGoal,
  getRegisterFileOpen,
  getAbandonedRegistration,
  getYoungValidatedFromWaitingStatus,
  getYoungWithdrawnAfterValidated,
  getYoungAbandonedBeforeValidated,
  getYoungWhoChangedCohort,
  getYoungWhoMovedOutFromDepartment,
  getYoungWhoMovedInFromDepartment,
} = require("./inscription");

const keyNumbersByRole = {
  sejour: {
    [ROLES.REFERENT_DEPARTMENT]: [getYoungNotesPhase1, getTimeScheduleAndPedagoProject],
    [ROLES.REFERENT_REGION]: [getTimeScheduleAndPedagoProject, getTransportCorrectionRequests],
    [ROLES.ADMIN]: [getTransportCorrectionRequests, getSessions, getLineToPoints],
  },
  inscription: {
    [ROLES.REFERENT_DEPARTMENT]: [
      getYoungNotesPhase0,
      getRegisterFileOpen,
      getYoungWithdrawnAfterValidated,
      getYoungAbandonedBeforeValidated,
      getYoungWhoChangedCohort,
      getYoungValidatedFromWaitingStatus,
      getYoungWhoMovedOutFromDepartment,
      getYoungWhoMovedInFromDepartment,
    ],
    [ROLES.REFERENT_REGION]: [
      getYoungRegisteredWithParticularSituation,
      getDepartmentRegistrationGoal,
      getRegisterFileOpen,
      getYoungWithdrawnAfterValidated,
      getAbandonedRegistration,
      getYoungValidatedFromWaitingStatus,
      getYoungWhoChangedCohort,
    ],
    [ROLES.ADMIN]: [getRegisterFileOpen, getYoungWithdrawnAfterValidated, getYoungValidatedFromWaitingStatus, getYoungWhoChangedCohort],
  },
  engagement: {
    [ROLES.REFERENT_DEPARTMENT]: [getNewStructures, getYoungNotesPhase2, getMissionsOnTerm, getContractsSigned, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus],
    [ROLES.REFERENT_REGION]: [getYoungPhase2Validated],
    [ROLES.SUPERVISOR]: [getMissionsOnTerm, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus],
    [ROLES.RESPONSIBLE]: [getMissionsOnTerm, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus],
    [ROLES.ADMIN]: [getContractsSigned, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus],
  },
  all: {
    [ROLES.REFERENT_DEPARTMENT]: [
      getYoungNotesPhase1,
      getTimeScheduleAndPedagoProject,
      getNewStructures,
      getYoungNotesPhase2,
      getMissionsOnTerm,
      getContractsSigned,
      getYoungNotesPhase0,
      getRegisterFileOpen,
      getYoungsWhoStartedOrFinishedMissions,
      getMissionsChangeStatus,
      getYoungValidatedFromWaitingStatus,
      getYoungWhoChangedCohort,
    ],
    [ROLES.REFERENT_REGION]: [
      getTimeScheduleAndPedagoProject,
      getTransportCorrectionRequests,
      getYoungPhase2Validated,
      getYoungRegisteredWithParticularSituation,
      getDepartmentRegistrationGoal,
      getRegisterFileOpen,
      getAbandonedRegistration,
      getYoungValidatedFromWaitingStatus,
      getYoungWhoChangedCohort,
    ],
    [ROLES.SUPERVISOR]: [getMissionsOnTerm, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus],
    [ROLES.RESPONSIBLE]: [getMissionsOnTerm, getYoungsWhoStartedOrFinishedMissions, getMissionsChangeStatus],
    [ROLES.ADMIN]: [
      getTransportCorrectionRequests,
      getSessions,
      getLineToPoints,
      getContractsSigned,
      getYoungsWhoStartedOrFinishedMissions,
      getMissionsChangeStatus,
      getRegisterFileOpen,
      getYoungValidatedFromWaitingStatus,
      getYoungWhoChangedCohort,
    ],
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
