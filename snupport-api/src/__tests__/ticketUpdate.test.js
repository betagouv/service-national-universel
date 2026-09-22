const { getForbiddenTicketUpdateFields, getAgentSignature, reconcileTicketNotes } = require("../utils/ticketUpdate");

describe("getForbiddenTicketUpdateFields", () => {
  describe("AGENT, ADMIN and DG roles", () => {
    it.each(["AGENT", "ADMIN", "DG"])("lets %s write every field of the route schema", (role) => {
      const body = { contactEmail: "a@b.fr", contactDepartment: "Rhône", formSubjectStep1: "TECHNICAL", subject: "x", agentId: "1", notes: [] };
      expect(getForbiddenTicketUpdateFields({ role }, body)).toEqual([]);
    });
  });

  describe("REFERENT_DEPARTMENT role", () => {
    it("allows the fields the agent UI offers to a departmental referent", () => {
      const body = {
        status: "CLOSED",
        tagsId: ["1"],
        messageDraft: "brouillon",
        notes: [],
        contactGroup: "young",
        referentDepartmentId: "2",
        referentDepartmentFirstName: "Bob",
        referentDepartmentLastName: "Referent",
        referentDepartmentEmail: "bob@example.com",
      };
      expect(getForbiddenTicketUpdateFields({ role: "REFERENT_DEPARTMENT" }, body)).toEqual([]);
    });

    it.each(["contactEmail", "contactDepartment", "contactAttributes", "formSubjectStep1", "subject", "canal", "feedback", "agentId", "referentRegionId"])(
      "rejects %s",
      (field) => {
        expect(getForbiddenTicketUpdateFields({ role: "REFERENT_DEPARTMENT" }, { [field]: "whatever" })).toEqual([field]);
      }
    );

    it("reports every forbidden field of a mixed payload", () => {
      const body = { status: "OPEN", contactEmail: "attaquant@example.com", contactDepartment: "Rhône" };
      expect(getForbiddenTicketUpdateFields({ role: "REFERENT_DEPARTMENT" }, body)).toEqual(["contactEmail", "contactDepartment"]);
    });
  });

  describe("REFERENT_REGION role", () => {
    it("additionally allows the region assignment fields", () => {
      const body = { referentRegionId: "2", referentRegionFirstName: "Bob", referentRegionLastName: "Referent", referentRegionEmail: "bob@example.com" };
      expect(getForbiddenTicketUpdateFields({ role: "REFERENT_REGION" }, body)).toEqual([]);
    });

    it.each(["contactEmail", "contactDepartment", "formSubjectStep1", "agentId"])("rejects %s", (field) => {
      expect(getForbiddenTicketUpdateFields({ role: "REFERENT_REGION" }, { [field]: "whatever" })).toEqual([field]);
    });
  });
});

describe("getAgentSignature", () => {
  it("builds the same signature as the agent UI", () => {
    expect(getAgentSignature({ firstName: "Bob", lastName: "Referent", role: "REFERENT_DEPARTMENT" })).toBe("Bob Referent - Référent départemental");
  });

  it("falls back to the raw role when it has no label", () => {
    expect(getAgentSignature({ firstName: "Dana", lastName: "Générale", role: "DG" })).toBe("Dana Générale - DG");
  });
});

describe("reconcileTicketNotes", () => {
  const AGENT = { firstName: "Alice", lastName: "Support", role: "AGENT" };
  const REFERENT = { firstName: "Bob", lastName: "Referent", role: "REFERENT_DEPARTMENT" };
  const existingNote = { content: "Note interne du support", authorName: "Alice Support - Agent", createdAt: new Date("2026-01-01T10:00:00.000Z") };

  it("keeps the stored author of a note the client resends untouched", () => {
    const notes = reconcileTicketNotes({ user: REFERENT, storedNotes: [existingNote], submittedNotes: [{ ...existingNote }] });
    expect(notes).toHaveLength(1);
    expect(notes[0].authorName).toBe("Alice Support - Agent");
  });

  it("signs a note a referent adds with the referent's own identity", () => {
    const notes = reconcileTicketNotes({
      user: REFERENT,
      storedNotes: [existingNote],
      submittedNotes: [{ ...existingNote }, { content: "Ajout du référent", authorName: "Alice Support - Agent", createdAt: new Date() }],
    });
    expect(notes).toHaveLength(2);
    expect(notes[1].authorName).toBe("Bob Referent - Référent départemental");
    expect(notes[1].content).toBe("Ajout du référent");
  });

  it("does not let a forged creation date inherit another agent's authorship", () => {
    const notes = reconcileTicketNotes({
      user: REFERENT,
      storedNotes: [existingNote],
      submittedNotes: [{ ...existingNote }, { content: "Dossier classé sans suite", authorName: "Alice Support - Agent", createdAt: existingNote.createdAt }],
    });
    expect(notes).toHaveLength(2);
    expect(notes[1].authorName).toBe("Bob Referent - Référent départemental");
  });

  it("restores the stored notes a referent tries to delete", () => {
    const notes = reconcileTicketNotes({ user: REFERENT, storedNotes: [existingNote], submittedNotes: [] });
    expect(notes).toEqual([{ content: existingNote.content, createdAt: existingNote.createdAt, authorName: existingNote.authorName }]);
  });

  it("restores the stored content a referent tries to rewrite", () => {
    const notes = reconcileTicketNotes({
      user: REFERENT,
      storedNotes: [existingNote],
      submittedNotes: [{ ...existingNote, content: "Contenu réécrit" }],
    });
    expect(notes).toEqual([{ content: existingNote.content, createdAt: existingNote.createdAt, authorName: existingNote.authorName }]);
  });

  it("lets an agent delete a note", () => {
    expect(reconcileTicketNotes({ user: AGENT, storedNotes: [existingNote], submittedNotes: [] })).toEqual([]);
  });

  it("lets an agent edit a note without changing its author", () => {
    const notes = reconcileTicketNotes({ user: AGENT, storedNotes: [existingNote], submittedNotes: [{ ...existingNote, content: "Contenu corrigé" }] });
    expect(notes).toEqual([{ content: "Contenu corrigé", createdAt: existingNote.createdAt, authorName: "Alice Support - Agent" }]);
  });

  it("signs a note an agent adds with the agent's own identity", () => {
    const notes = reconcileTicketNotes({
      user: AGENT,
      storedNotes: [],
      submittedNotes: [{ content: "Nouvelle note", authorName: "Carole Admin - Admin", createdAt: new Date() }],
    });
    expect(notes[0].authorName).toBe("Alice Support - Agent");
  });
});
