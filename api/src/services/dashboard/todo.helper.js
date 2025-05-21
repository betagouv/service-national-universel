const { ROLES, YOUNG_SOURCE } = require("snu-lib");
const helpers = {};
const { SessionPhase1Model, ReferentModel } = require("../../models");

helpers.queryFromFilter = (role, region, department, filter, { regionField = "region.keyword", departmentField = "department.keyword" } = {}) => {
  const body = {
    size: 0,
    track_total_hits: 1000, // We don't need the exact number of hits when more than 1000.
    query: { bool: { must: { match_all: {} }, filter } },
  };
  if (role === ROLES.REFERENT_REGION) body.query.bool.filter.push({ term: { [regionField]: region } });
  if (role === ROLES.REFERENT_DEPARTMENT) body.query.bool.filter.push({ terms: { [departmentField]: department } });
  if (role === ROLES.REFERENT_DEPARTMENT) body.query.bool.filter.push({ bool: { must_not: { term: { "source.keyword": YOUNG_SOURCE.CLE } } } });
  return body;
};

helpers.withAggs = (body, fieldName = "cohort.keyword") => {
  return {
    ...body,
    aggs: { [fieldName.replace(".keyword", "")]: { terms: { field: fieldName, size: 1000 } } },
  };
};

helpers.buildFilterContext = async (user, cohorts, index) => {
  // Adding context filter for a special user role :
  // 1. create a function which return filter depending index
  // 2. add your user role in the first switch case

  switch (user.role) {
    case ROLES.HEAD_CENTER:
    case ROLES.HEAD_CENTER_ADJOINT:
    case ROLES.REFERENT_SANITAIRE:
      return contextForHeadCenter(user, cohorts, index);
    default:
      return null;
  }

  async function contextForHeadCenter(user, cohorts, index) {
    let session = null;
    if (user.role === ROLES.HEAD_CENTER) {
      session = await SessionPhase1Model.findOne({ headCenterId: user._id, cohort: cohorts });
    } else if ([ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(user.role)) {
      session = await SessionPhase1Model.findOne({ adjointsIds: { $in: [user._id] }, cohort: cohorts });
    }
    if (!session?._id) {
      return null;
    } else {
      switch (index) {
        case "young":
          return { term: { "sessionPhase1Id.keyword": session._id } };
        case "sessionphase1":
          return { ids: { values: [session._id] } };
        default:
          return null;
      }
    }
  }
};

module.exports = helpers;
