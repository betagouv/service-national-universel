const { ROLES } = require("snu-lib");
const helpers = {};
const sessionPhase1Model = require("../../models/sessionPhase1");

helpers.queryFromFilter = (role, region, department, filter, { regionField = "region.keyword", departmentField = "department.keyword" } = {}) => {
  const body = {
    size: 0,
    track_total_hits: 1000, // We don't need the exact number of hits when more than 1000.
    query: { bool: { must: { match_all: {} }, filter } },
  };
  if (role === ROLES.REFERENT_REGION) body.query.bool.filter.push({ term: { [regionField]: region } });
  if (role === ROLES.REFERENT_DEPARTMENT) body.query.bool.filter.push({ terms: { [departmentField]: department } });
  return body;
};

helpers.withAggs = (body, fieldName = "cohort.keyword") => {
  return {
    ...body,
    aggs: { [fieldName.replace(".keyword", "")]: { terms: { field: fieldName, size: 1000 } } },
  };
};

helpers.buildFilterForHC = async (user, cohorts) => {
  const session = await sessionPhase1Model.findOne({ headCenterId: user._id, cohort: cohorts });
  if (!session?._id) {
    return false;
  } else {
    return { ids: { values: [session._id] } };
  }
};

module.exports = helpers;
