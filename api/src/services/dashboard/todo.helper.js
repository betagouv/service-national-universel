const { ROLES } = require("snu-lib");
const helpers = {};

helpers.queryFromFilter = (
  role,
  region,
  department,
  filter,
  user_id,
  { regionField = "region.keyword", departmentField = "department.keyword", headCenterField = "headCenterId.keyword" } = {},
) => {
  const body = {
    size: 0,
    track_total_hits: 1000, // We don't need the exact number of hits when more than 1000.
    query: { bool: { must: { match_all: {} }, filter } },
  };
  if (role === ROLES.REFERENT_REGION) body.query.bool.filter.push({ term: { [regionField]: region } });
  if (role === ROLES.REFERENT_DEPARTMENT) body.query.bool.filter.push({ terms: { [departmentField]: department } });
  if (role === ROLES.HEAD_CENTER) body.query.bool.filter.push({ term: { [headCenterField]: user_id } });
  return body;
};

helpers.withAggs = (body, fieldName = "cohort.keyword") => {
  return {
    ...body,
    aggs: { [fieldName.replace(".keyword", "")]: { terms: { field: fieldName, size: 1000 } } },
  };
};

module.exports = helpers;
