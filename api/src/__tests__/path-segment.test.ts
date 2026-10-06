import { isSafePathSegment, safePathSegment } from "../utils/pathSegment";

describe("isSafePathSegment — un segment désigne un seul niveau de l'arborescence", () => {
  it.each([
    ["une clé de pièce", "equivalenceFiles"],
    ["un nom produit par l'interface", "justificatif-0.pdf"],
    ["un nom avec espaces et accents", "Pièce d'identité (1).pdf"],
    ["un nom avec des points successifs au milieu", "a..b.pdf"],
    ["un nom commençant par des points", "..cache.pdf"],
    ["un nom finissant par des points", "fichier.."],
    ["un identifiant de fichier", "6501a9c3f1d2b4e5a7c80912"],
    ["un caractère % littéral", "100%.pdf"],
  ])("accepte %s", (_label, value) => {
    expect(isSafePathSegment(value)).toBe(true);
  });

  it.each([
    ["un slash", "military-preparation/militaryPreparationFilesIdentity"],
    ["un slash initial", "/cniFiles"],
    ["un slash final", "cniFiles/"],
    ["une remontée dans un sous-chemin", "../../2/cniFiles/id"],
    ["un antislash", "dossier\\fichier.pdf"],
    ["un antislash isolé", "\\"],
    ["le segment ..", ".."],
    ["le segment .", "."],
    ["un octet nul", "fichier\u0000.pdf"],
    ["un octet nul final", "cniFiles\u0000"],
    ["un retour à la ligne", "fichier\n.pdf"],
    ["un retour chariot", "fichier\r.pdf"],
    ["une tabulation", "fichier\t.pdf"],
    ["un caractère de contrôle C0", "fichier\u001f.pdf"],
    ["le caractère DEL", "fichier\u007f.pdf"],
    ["un caractère de contrôle C1", "fichier\u0085.pdf"],
    ["une chaîne vide", ""],
  ])("refuse %s", (_label, value) => {
    expect(isSafePathSegment(value)).toBe(false);
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["un nombre", 12],
    ["un tableau", ["cniFiles"]],
    ["un objet", { $ne: "" }],
  ])("refuse %s", (_label, value) => {
    expect(isSafePathSegment(value)).toBe(false);
  });
});

describe("safePathSegment — schéma Joi", () => {
  it("laisse passer un nom de fichier légitime", () => {
    const { error, value } = safePathSegment().required().validate("Pièce d'identité (1).pdf");
    expect(error).toBeUndefined();
    expect(value).toBe("Pièce d'identité (1).pdf");
  });

  it.each(["a/b", "..", "a\\b", "a\u0000b", "a\nb"])("refuse %j", (value) => {
    const { error } = safePathSegment().required().validate(value);
    expect(error).toBeDefined();
  });

  it("refuse l'absence de valeur lorsqu'elle est requise", () => {
    const { error } = safePathSegment().required().validate(undefined);
    expect(error).toBeDefined();
  });
});
