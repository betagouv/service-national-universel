// Lot P (L51) : les recherches d'auto-complétion (shortcut/search, tag/search, kb-search) alimentaient
// un `$regex` avec la saisie brute — injection NoSQL et ReDoS possibles.
const { autocompleteRegex } = require("../utils/searchRegex");

describe("autocompleteRegex", () => {
  it("échappe les métacaractères de regex (pas d'injection NoSQL / ReDoS)", () => {
    // `.*` doit être traité comme littéral, pas comme « n'importe quoi ».
    const pattern = autocompleteRegex(".*");
    expect(pattern).toBe("^\\.\\*.*$");
    expect(new RegExp(pattern).test("nimportequoi")).toBe(false);
    expect(new RegExp(pattern).test(".*suite")).toBe(true);
  });

  it("neutralise un motif catastrophique (ReDoS)", () => {
    // Les quantificateurs imbriqués sont échappés : le moteur ne peut plus être piégé.
    const pattern = autocompleteRegex("(a+)+$");
    expect(pattern).toContain("\\+\\)\\+\\$"); // les `+`, `)` et `$` sont littéraux
    expect(pattern).not.toContain("(a+)+"); // plus aucun quantificateur actif issu de la saisie
  });

  it("ancre le motif en tête", () => {
    expect(autocompleteRegex("abc").startsWith("^")).toBe(true);
  });

  it("reste tolérant aux diacritiques", () => {
    expect(new RegExp(autocompleteRegex("ecole"), "i").test("école")).toBe(true);
  });

  it("gère une saisie vide", () => {
    expect(autocompleteRegex()).toBe("^.*$");
  });
});
