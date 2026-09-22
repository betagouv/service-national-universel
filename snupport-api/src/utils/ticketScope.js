// AGENT/DG are central support staff without geographic scoping, matching the
// existing filter logic in ticket.ts's buildContextFilter. REFERENT_DEPARTMENT and
// REFERENT_REGION are restricted to their own department(s)/region, and fail closed
// (deny) when the ticket carries no contact department/region to compare against.
function canAccessTicket(user, ticket) {
  if (user.role === "REFERENT_DEPARTMENT") {
    return Boolean(ticket.contactDepartment) && Boolean(user.departments) && user.departments.includes(ticket.contactDepartment);
  }
  if (user.role === "REFERENT_REGION") {
    return Boolean(ticket.contactRegion) && ticket.contactRegion === user.region;
  }
  return true;
}

// Same scoping rule as canAccessTicket, expressed as a Mongo query filter for list-style
// endpoints (mirrors the pattern already used in ticket.ts's buildContextFilter).
function scopeTicketQuery(user, baseQuery) {
  const query = { ...baseQuery };
  if (user.role === "REFERENT_DEPARTMENT") {
    query.contactDepartment = { $in: user.departments };
    query.formSubjectStep1 = "QUESTION";
  }
  if (user.role === "REFERENT_REGION") {
    query.contactRegion = user.region;
    query.formSubjectStep1 = "QUESTION";
  }
  return query;
}

module.exports = { canAccessTicket, scopeTicketQuery };
