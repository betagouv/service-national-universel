const { canAccessTicket, scopeTicketQuery } = require("../utils/ticketScope");

describe("canAccessTicket", () => {
  describe("AGENT and DG roles", () => {
    it.each(["AGENT", "DG"])("allows %s to access a ticket outside any department or region", (role) => {
      const user = { role };
      const ticket = { contactDepartment: "Paris", contactRegion: "Ile-de-France" };
      expect(canAccessTicket(user, ticket)).toBe(true);
    });
  });

  describe("REFERENT_DEPARTMENT role", () => {
    it("allows access when the ticket's contact department is in the referent's departments", () => {
      const user = { role: "REFERENT_DEPARTMENT", departments: ["Paris", "Essonne"] };
      const ticket = { contactDepartment: "Paris" };
      expect(canAccessTicket(user, ticket)).toBe(true);
    });

    it("denies access when the ticket's contact department is outside the referent's departments", () => {
      const user = { role: "REFERENT_DEPARTMENT", departments: ["Paris", "Essonne"] };
      const ticket = { contactDepartment: "Rhône" };
      expect(canAccessTicket(user, ticket)).toBe(false);
    });

    it("denies access when the ticket has no contact department", () => {
      const user = { role: "REFERENT_DEPARTMENT", departments: ["Paris"] };
      const ticket = {};
      expect(canAccessTicket(user, ticket)).toBe(false);
    });
  });

  describe("REFERENT_REGION role", () => {
    it("allows access when the ticket's contact region matches the referent's region", () => {
      const user = { role: "REFERENT_REGION", region: "Ile-de-France" };
      const ticket = { contactRegion: "Ile-de-France" };
      expect(canAccessTicket(user, ticket)).toBe(true);
    });

    it("denies access when the ticket's contact region differs from the referent's region", () => {
      const user = { role: "REFERENT_REGION", region: "Ile-de-France" };
      const ticket = { contactRegion: "Bretagne" };
      expect(canAccessTicket(user, ticket)).toBe(false);
    });

    it("denies access when the ticket has no contact region", () => {
      const user = { role: "REFERENT_REGION", region: "Ile-de-France" };
      const ticket = {};
      expect(canAccessTicket(user, ticket)).toBe(false);
    });
  });
});

describe("scopeTicketQuery", () => {
  describe("AGENT and DG roles", () => {
    it.each(["AGENT", "DG"])("leaves the base query untouched for %s", (role) => {
      const user = { role };
      expect(scopeTicketQuery(user, { contactId: "abc" })).toEqual({ contactId: "abc" });
    });
  });

  describe("REFERENT_DEPARTMENT role", () => {
    it("restricts the query to the referent's departments and QUESTION tickets", () => {
      const user = { role: "REFERENT_DEPARTMENT", departments: ["Paris", "Essonne"] };
      expect(scopeTicketQuery(user, { contactId: "abc" })).toEqual({
        contactId: "abc",
        contactDepartment: { $in: ["Paris", "Essonne"] },
        formSubjectStep1: "QUESTION",
      });
    });
  });

  describe("REFERENT_REGION role", () => {
    it("restricts the query to the referent's region and QUESTION tickets", () => {
      const user = { role: "REFERENT_REGION", region: "Ile-de-France" };
      expect(scopeTicketQuery(user, { contactId: "abc" })).toEqual({
        contactId: "abc",
        contactRegion: "Ile-de-France",
        formSubjectStep1: "QUESTION",
      });
    });
  });
});
