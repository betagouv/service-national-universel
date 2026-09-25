// Field-level authorization for PATCH /ticket/:id.
//
// canAccessTicket (ticketScope.js) only answers "may this user touch this ticket at all".
// It says nothing about *which* fields may be written, so any agent reaching a ticket could
// rewrite every field accepted by the route's Joi schema. AGENT/ADMIN/DG are central support
// staff without geographic scoping; AGENT/ADMIN keep full write access, DG is read-only. REFERENT_DEPARTMENT and
// REFERENT_REGION are scoped to their own department(s)/region through contactDepartment,
// contactRegion and formSubjectStep1, and the agent UI only offers them the status, the tags,
// the draft, the notes, the contact group and the referent assignment. Everything else
// (contactEmail, contactDepartment, contactAttributes, formSubjectStep1, subject, canal,
// feedback, agent*) would let them move the ticket out of their perimeter or reroute the
// contact notifications, so it is denied.

const REFERENT_ROLES = ["REFERENT_DEPARTMENT", "REFERENT_REGION"];

const REFERENT_WRITABLE_FIELDS = [
  "status",
  "tagsId",
  "messageDraft",
  "notes",
  "contactGroup",
  "referentDepartmentId",
  "referentDepartmentFirstName",
  "referentDepartmentLastName",
  "referentDepartmentEmail",
];

// Only REFERENT_REGION gets the region assignment dropdown in the agent UI.
// DG is read-only: an empty list rejects any field (the route also refuses the role upfront).
const WRITABLE_FIELDS_BY_ROLE = {
  DG: [],
  REFERENT_DEPARTMENT: REFERENT_WRITABLE_FIELDS,
  REFERENT_REGION: [...REFERENT_WRITABLE_FIELDS, "referentRegionId", "referentRegionFirstName", "referentRegionLastName", "referentRegionEmail"],
};

const ROLE_LABELS = {
  ADMIN: "Admin",
  AGENT: "Agent",
  REFERENT_REGION: "Référent régional",
  REFERENT_DEPARTMENT: "Référent départemental",
};

// Roles without an entry in WRITABLE_FIELDS_BY_ROLE keep unrestricted write access.
function getForbiddenTicketUpdateFields(user, body) {
  const writableFields = WRITABLE_FIELDS_BY_ROLE[user.role];
  if (!writableFields) return [];
  return Object.keys(body).filter((field) => !writableFields.includes(field));
}

// Mirrors the signature the agent UI builds for a note author.
function getAgentSignature(user) {
  return `${user.firstName} ${user.lastName} - ${ROLE_LABELS[user.role] || user.role}`;
}

// The client resends the whole notes array on every change and the serializer drops the
// subdocument ids, so a submitted note carries no trustworthy identity: authorName and
// createdAt are attacker-controlled and can impersonate another agent. Submitted notes are
// therefore re-paired with the stored ones by creation date (each stored note matches at
// most once, so a forged duplicate date cannot inherit an author), matched notes keep their
// stored author, and anything else is signed server-side with the acting agent.
// Referents can only add notes in the UI, so their stored notes are restored as-is and only
// their additions are kept.
function reconcileTicketNotes({ user, storedNotes = [], submittedNotes = [] }) {
  const signature = getAgentSignature(user);
  const pool = storedNotes.map((note) => ({ note, taken: false }));

  const entries = submittedNotes.map((submitted) => {
    const submittedAt = submitted.createdAt ? new Date(submitted.createdAt).getTime() : NaN;
    const match = pool.find((entry) => !entry.taken && new Date(entry.note.createdAt).getTime() === submittedAt);
    if (match) {
      match.taken = true;
      return { isNew: false, note: { content: submitted.content, createdAt: match.note.createdAt, authorName: match.note.authorName } };
    }
    return { isNew: true, note: { content: submitted.content, createdAt: new Date(), authorName: signature } };
  });

  if (!REFERENT_ROLES.includes(user.role)) return entries.map((entry) => entry.note);

  const preservedNotes = storedNotes.map((note) => ({ content: note.content, createdAt: note.createdAt, authorName: note.authorName }));
  const addedNotes = entries.filter((entry) => entry.isNew).map((entry) => entry.note);
  return [...preservedNotes, ...addedNotes];
}

module.exports = { getForbiddenTicketUpdateFields, getAgentSignature, reconcileTicketNotes };
