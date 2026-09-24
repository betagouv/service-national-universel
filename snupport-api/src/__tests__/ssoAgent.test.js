const { buildSsoAgentQuery } = require("../utils/ssoAgent");

describe("buildSsoAgentQuery", () => {
  it("désigne le compte par l'identifiant du référent SNU et contrôle l'email", () => {
    expect(buildSsoAgentQuery({ email: "referent@snu.gouv.fr", snuReferentId: "6ab19d5ed8e8941f0c1baa23" })).toEqual({
      snuReferentId: "6ab19d5ed8e8941f0c1baa23",
      email: "referent@snu.gouv.fr",
      role: { $in: ["REFERENT_DEPARTMENT", "REFERENT_REGION"] },
    });
  });

  it("refuse une requête sans identifiant de référent plutôt que de chercher sur le seul email", () => {
    expect(buildSsoAgentQuery({ email: "dg@snu.gouv.fr" })).toBeNull();
    expect(buildSsoAgentQuery({ email: "dg@snu.gouv.fr", snuReferentId: "" })).toBeNull();
    expect(buildSsoAgentQuery({ email: "dg@snu.gouv.fr", snuReferentId: null })).toBeNull();
  });

  it("refuse une requête sans email", () => {
    expect(buildSsoAgentQuery({ snuReferentId: "6ab19d5ed8e8941f0c1baa23" })).toBeNull();
  });

  it("ne produit jamais un filtre qui n'est pas contraint sur snuReferentId", () => {
    const query = buildSsoAgentQuery({ email: "a@snu.gouv.fr", snuReferentId: "6ab19d5ed8e8941f0c1baa23" });
    expect(Object.keys(query).sort()).toEqual(["email", "role", "snuReferentId"]);
    expect(typeof query.snuReferentId).toBe("string");
  });

  it("n'ouvre par SSO qu'un compte référent, jamais un agent du support (GOO-13)", () => {
    const query = buildSsoAgentQuery({ email: "a@snu.gouv.fr", snuReferentId: "6ab19d5ed8e8941f0c1baa23" });
    expect(query.role.$in).not.toContain("AGENT");
    expect(query.role.$in).not.toContain("DG");
  });
});
