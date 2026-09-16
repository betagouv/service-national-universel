const { canAccessContact } = require("../utils/contactScope");

describe("canAccessContact", () => {
  describe("non-young contacts (or agents)", () => {
    it.each(["responsible", "admin", "referent_department", undefined])(
      "allows any role to access a contact with role %s, regardless of department or region",
      (role) => {
        const user = { role: "REFERENT_DEPARTMENT", departments: ["Paris"] };
        const contact = { role, department: "Rhône", region: "Bretagne" };
        expect(canAccessContact(user, contact)).toBe(true);
      }
    );
  });

  describe("young contacts", () => {
    describe("AGENT, ADMIN and DG roles", () => {
      it.each(["AGENT", "ADMIN", "DG"])("allows %s to access a young contact outside any department or region", (role) => {
        const user = { role };
        const contact = { role: "young", department: "Paris", region: "Ile-de-France" };
        expect(canAccessContact(user, contact)).toBe(true);
      });
    });

    describe("REFERENT_DEPARTMENT role", () => {
      it("allows access when the young contact's department is in the referent's departments", () => {
        const user = { role: "REFERENT_DEPARTMENT", departments: ["Paris", "Essonne"] };
        const contact = { role: "young", department: "Paris" };
        expect(canAccessContact(user, contact)).toBe(true);
      });

      it("denies access when the young contact's department is outside the referent's departments", () => {
        const user = { role: "REFERENT_DEPARTMENT", departments: ["Paris", "Essonne"] };
        const contact = { role: "young", department: "Rhône" };
        expect(canAccessContact(user, contact)).toBe(false);
      });

      it("denies access when the young contact has no department", () => {
        const user = { role: "REFERENT_DEPARTMENT", departments: ["Paris"] };
        const contact = { role: "young" };
        expect(canAccessContact(user, contact)).toBe(false);
      });
    });

    describe("REFERENT_REGION role", () => {
      it("allows access when the young contact's region matches the referent's region", () => {
        const user = { role: "REFERENT_REGION", region: "Ile-de-France" };
        const contact = { role: "young", region: "Ile-de-France" };
        expect(canAccessContact(user, contact)).toBe(true);
      });

      it("denies access when the young contact's region differs from the referent's region", () => {
        const user = { role: "REFERENT_REGION", region: "Ile-de-France" };
        const contact = { role: "young", region: "Bretagne" };
        expect(canAccessContact(user, contact)).toBe(false);
      });

      it("denies access when the young contact has no region", () => {
        const user = { role: "REFERENT_REGION", region: "Ile-de-France" };
        const contact = { role: "young" };
        expect(canAccessContact(user, contact)).toBe(false);
      });
    });
  });
});
