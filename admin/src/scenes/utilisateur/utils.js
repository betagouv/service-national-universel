import { ROLES, translate } from "../../utils";

// @todo : supervisor has structure ?
export const roleOptions = [
  ROLES.REFERENT_DEPARTMENT,
  ROLES.REFERENT_REGION,
  ROLES.ADMIN,
  ROLES.RESPONSIBLE,
  ROLES.SUPERVISOR,
  ROLES.HEAD_CENTER,
  ROLES.VISITOR,
  ROLES.DSNJ,
  ROLES.INJEP,
].map((key) => ({
  value: key,
  label: translate(key),
}));

export const MODE_DEFAULT = "default";
export const MODE_EDITION = "edition";

export const formatSessionOptions = (phase1Sessions, sessionsWhereUserIsHeadCenter) => {
  const cohortsWhereUserIsHeadCenter = sessionsWhereUserIsHeadCenter.map((session) => session.cohort);
  return phase1Sessions
    .filter((s) => {
      return !s.headCenterId && !cohortsWhereUserIsHeadCenter.includes(s.cohort);
    })
    .reduce((sessionAcc, currentSession) => {
      const addedCenter = sessionAcc.find((session) => session.cohesionCenterId === currentSession.cohesionCenterId);
      if (addedCenter) {
        return sessionAcc.map((currentSessionAcc) => {
          if (currentSessionAcc.cohesionCenterId === addedCenter.cohesionCenterId) {
            const updatedCohort = { ...addedCenter, cohorts: [...addedCenter.cohorts, { cohort: currentSession.cohort, sessionPhase1Id: currentSession._id }] };
            return updatedCohort;
          }
          return currentSessionAcc;
        });
      } else {
        return [
          ...sessionAcc,
          {
            cohesionCenterId: currentSession.cohesionCenterId,
            nameCentre: currentSession.nameCentre,
            cohorts: [{ cohort: currentSession.cohort, sessionPhase1Id: currentSession._id }],
          },
        ];
      }
    }, [])
    .sort((session1, session2) => {
      const sessionCenterName1 = session1.nameCentre?.toLowerCase(),
        sessionCenterName2 = session2.nameCentre?.toLowerCase();
      if (sessionCenterName1 < sessionCenterName2) {
        return -1;
      }
      if (sessionCenterName1 > sessionCenterName2) {
        return 1;
      }
      return 0;
    });
};

export const getSubRoleOptions = (subRoles) => {
  return Object.keys(subRoles).map((e) => ({ value: e, label: translate(subRoles[e]) }));
};
