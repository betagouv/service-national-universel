const APP_PREFIX = "analytics";

module.exports = {
  APP_PREFIX,
  PG_CACHE: `${APP_PREFIX}:pgcache`,
  LOG_MISSIONS_FIND_BY_NAME_STATUS: `logmissions:findbynameandstatus`,
  LOG_MISSIONS_FIND_BY_NAME_STATUS_DEPARTMENT: `logmissions:findbynameandstatusdepartment`,
  LOG_MISSIONS_FIND_BY_NAME_STATUS_STRUCTURE_ID: `logmissions:findbynameandstatusstructureid`,
  LOGS_DAY_APP_STATUS_CHANGE_FIND_BY_STATUS: `logsdayappstatuschange:findbystatus`,
  LOGS_DAY_APP_STATUS_CHANGE_FIND_BY_STATUS_DEPARTMENT: `logsdayappstatuschange:findbystatusanddepartment`,
  LOGS_DAY_APP_STATUS_CHANGE_FIND_BY_STATUS_STRUCTURE_ID: `logsdayappstatuschange:findbystatusandstructureid`,
  LOGS_DAY_APP_STATUS_CHANGE_ACCEPTED_REFUSED: `logsdayappstatuschange:acceptedrefused`,
  LOGS_DAY_USER_COHORT_COUNT: `logsdayusercohort:count`,
  LOGS_DAY_USER_COHORT_COUNT_REGION: `logsdayusercohort:countbyregion`,
  LOGS_DAY_USER_COHORT_COUNT_DEPARTMENT: `logsdayusercohort:countbydepartment`,
  LOGS_DAY_USER_STATUS_COUNT_STATUS: `logsdayuserstatus:countbystatus`,
  LOGS_DAY_USER_STATUS_COUNT_STATUS_REGION: `logsdayuserstatus:countbystatusandregion`,
  LOGS_DAY_USER_STATUS_COUNT_STATUS_DEPARTMENT: `logsdayuserstatus:countbystatusanddepartment`,
  LOGS_DAY_USER_STATUS_QUERY_FROM_TO: `logsdayuserstatus:queryfromto`,
  LOGS_DAY_USER_STATUS_QUERY_FROM_TO_REGION: `logsdayuserstatus:queryfromtoregion`,
  LOGS_DAY_USER_STATUS_QUERY_FROM_TO_DEPARTMENT: `logsdayuserstatus:queryfromtodepartment`,
  LOGS_DAY_USER_STATUS_QUERY_MOVED_DEPARTURE: `logsdayuserstatus:querymoveddeparture`,
  LOGS_DAY_USER_STATUS_QUERY_MOVED_ARRIVAL: `logsdayuserstatus:querymovedarrival`,
};
