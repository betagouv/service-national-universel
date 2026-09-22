const { canEditKnowledgeBase } = require("../utils/knowledgeBaseScope");

describe("canEditKnowledgeBase", () => {
  it("autorise le personnel du support central", () => {
    expect(canEditKnowledgeBase({ role: "AGENT" })).toBe(true);
  });

  it.each(["REFERENT_DEPARTMENT", "REFERENT_REGION", "DG", "ADMIN"])("refuse le rôle %s", (role) => {
    expect(canEditKnowledgeBase({ role })).toBe(false);
  });

  it("refuse un référent SNU synchronisé même rattaché à un département", () => {
    expect(canEditKnowledgeBase({ role: "REFERENT_DEPARTMENT", isReferent: true, departments: ["Ain"] })).toBe(false);
  });

  it("refuse un utilisateur absent ou sans rôle", () => {
    expect(canEditKnowledgeBase(undefined)).toBe(false);
    expect(canEditKnowledgeBase(null)).toBe(false);
    expect(canEditKnowledgeBase({})).toBe(false);
  });
});
