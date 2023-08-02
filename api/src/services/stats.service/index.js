const { ROLES } = require("snu-lib");
const { getYoungNotesPhase1, getTimeSchedule, getTransportCorrectionRequests, getSessions, getLineToPoints } = require("./sejour");

const keyNumbersByRole = {
  sejour: {
    [ROLES.REFERENT_DEPARTMENT]: [getYoungNotesPhase1, getTimeSchedule],
    [ROLES.REFERENT_REGION]: [getTimeSchedule, getTransportCorrectionRequests],
    [ROLES.ADMIN]: [getTransportCorrectionRequests, getSessions, getLineToPoints],
  },
  inscription: {},
  engagement: {},
  all: {
    [ROLES.REFERENT_DEPARTMENT]: [getYoungNotesPhase1, getTimeSchedule],
    [ROLES.REFERENT_REGION]: [getTimeSchedule, getTransportCorrectionRequests],
    [ROLES.ADMIN]: [getTransportCorrectionRequests, getSessions, getLineToPoints],
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
  let notes = [];
  if (!Array.isArray(keyNumbersByRole[phase][user.role])) return notes; // TODO: remove when engagement and inscription are done
  for (const fn of keyNumbersByRole[phase][user.role]) {
    notes.push(...(await fn(startDate, endDate, user)));
  }
  return notes;
}

module.exports = {
  getKeyNumbers,
};
