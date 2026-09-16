// Mirrors the existing scoping already applied in contact.ts's /search: only "young" contacts
// are geographically scoped for REFERENT_DEPARTMENT/REFERENT_REGION (matching contact department
// or region data), every other contact role (staff, agents...) is unrestricted. Fails closed
// (deny) when a young contact carries no department/region to compare against.
function canAccessContact(user, contact) {
  if (contact.role !== "young") return true;
  if (user.role === "REFERENT_DEPARTMENT") {
    return Boolean(contact.department) && Boolean(user.departments) && user.departments.includes(contact.department);
  }
  if (user.role === "REFERENT_REGION") {
    return Boolean(contact.region) && contact.region === user.region;
  }
  return true;
}

module.exports = { canAccessContact };
