/**
 * Tests unitaires des fonctions PURES d'anonymisation RGPD.
 *
 * Pas de connexion Mongo : ces fonctions opèrent sur des objets simples
 * (sortie de `toObject()`), on les teste donc directement sans base.
 *
 * Deux niveaux (cf. design) :
 *  - INVARIANT RGPD : après anonymisation, la PII d'origine a disparu
 *    (valeur supprimée, masquée ou régénérée). C'est la garantie qui justifie
 *    la feature ; elle reste vraie même si l'implémentation est réécrite.
 *  - CARACTÉRISATION ciblée des mécaniques fragiles : le moteur de
 *    whitelist (`anonymizeNonDeclaredFields`) et la traduction
 *    `undefined → $unset` de `buildUpdate`, où un bug laisserait fuiter
 *    silencieusement de la PII.
 *
 * Garde anti-test-vide : chaque assertion « → supprimé/masqué » vérifie
 * d'abord que la valeur d'origine était bien présente (`toBeTruthy`), pour
 * qu'un champ absent du fixture ne fasse pas passer le test à vide.
 */
import anonymizeYoung from "../anonymization/young";
import anonymizeApplication from "../anonymization/application";
import anonymizeContract from "../anonymization/contract";
import { anonymizeNonDeclaredFields } from "../anonymization/utils/anonymise-model-fields";
import { STAR_EMAIL } from "../anonymization/utils/anonymise";
import { buildUpdate } from "../scripts/anonymizeOldCohorts.helpers";

import getNewYoungFixture from "./fixtures/young";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewContractFixture from "./fixtures/contract";

// Une valeur masquée ne contient plus que des étoiles et la ponctuation d'un email.
const MASKED_EMAIL = /^\*+@\*+\.\*+$/;
const ONLY_STARS = /^\*+$/;

describe("anonymizeNonDeclaredFields (moteur de whitelist)", () => {
  // BUG PRE-EXISTANT (cf. docs/anonymization-engine-noop-bug.md) : le moteur est
  // un NO-OP. `anonymizeNonDeclaredFields` fait `seen.add(item)` puis appelle
  // `getAllPaths(item, "", seen)`, qui court-circuite sur `seen.has(item)` et renvoie
  // un tableau vide. Aucun champ non-whiteliste n'est donc neutralise ; seules les
  // affectations explicites par modele (young.js / application.js / contract.js) font
  // le travail. Sans impact sur la PR : application et contract ont TOUS leurs champs
  // whitelistes, et le jeune est reecrit au plancher (moteur court-circuite).
  //
  // Le test ci-dessous CARACTERISE ce no-op (il documente la realite, il ne la valide
  // pas). C'est volontairement une sentinelle : le jour ou le moteur est corrige, il
  // deviendra ROUGE -> remplacer par le contrat attendu (cf. it.todo plus bas).
  it("NE NEUTRALISE RIEN aujourd'hui — renvoie l'objet inchangé (moteur no-op, BUG)", () => {
    const item: any = {
      keep: "stays",
      removeStr: "secret",
      removeNum: 42,
      nested: { keepInner: "stays", dropInner: "gone" },
      arrObj: [{ pii: "x" }],
    };

    const result: any = anonymizeNonDeclaredFields(item, ["keep", "nested.keepInner"]);

    // Aujourd'hui : tout survit, y compris les champs NON whitelistés (le bug).
    expect(result.keep).toEqual("stays");
    expect(result.removeStr).toEqual("secret"); // DEVRAIT être "" si le moteur marchait
    expect(result.removeNum).toEqual(42); // DEVRAIT être 0
    expect(result.nested.dropInner).toEqual("gone"); // DEVRAIT être ""
    expect(result.arrObj[0].pii).toEqual("x"); // DEVRAIT être ""
  });

  // Contrat ATTENDU une fois le moteur corrigé : champs whitelistés conservés, tous les
  // autres neutralisés par type (string->"", number->0, Date->maintenant, []->[], récursif).
  it.todo("devrait neutraliser les champs non-whitelistés (à activer après fix du moteur)");
});

describe("anonymize (young) — invariant RGPD", () => {
  it("supprime / masque / régénère toute la PII du jeune", () => {
    // phase3TutorEmail et mobilityNearRelativeName valent "" dans le fixture :
    // on les renseigne pour que la garde anti-test-vide soit significative.
    const young: any = getNewYoungFixture({
      phase3TutorEmail: "tuteur@example.com",
      mobilityNearRelativeName: "Mamie Jeanne",
    } as any);

    // Snapshot AVANT : anonymize() mute l'objet et le renvoie.
    const o = {
      email: young.email,
      firstName: young.firstName,
      phone: young.phone,
      handicap: young.handicap,
      ppsBeneficiary: young.ppsBeneficiary,
      medicosocialStructureName: young.medicosocialStructureName,
      hostFirstName: young.hostFirstName,
      phase3TutorEmail: young.phase3TutorEmail,
      mobilityNearRelativeName: young.mobilityNearRelativeName,
      zip: young.zip,
      city: young.city,
      parent1Email: young.parent1Email,
      parent1FirstName: young.parent1FirstName,
      password: young.password,
      birthdateAt: young.birthdateAt,
      status: young.status,
      cohort: young.cohort,
    };
    // Garde anti-test-vide : la PII était bien présente au départ.
    Object.entries(o).forEach(([key, value]) => expect(value).toBeTruthy());

    const result: any = anonymizeYoung(young);

    // Identité → régénérée (valeur différente de l'origine)
    expect(result.email).not.toEqual(o.email);
    expect(result.firstName).not.toEqual(o.firstName);
    expect(result.phone).not.toEqual(o.phone);
    // birthdate régénérée : peu d'entropie (~1000 valeurs), on vérifie la
    // structure plutôt que l'inégalité pour éviter un flaky.
    expect(result.birthdateAt).toBeInstanceOf(Date);

    // 🔴 Données de santé → supprimées
    expect(result.handicap).toBeUndefined();
    expect(result.ppsBeneficiary).toBeUndefined();
    expect(result.medicosocialStructureName).toBeUndefined();

    // 🔴 PII de tiers (famille d'accueil, tuteur, proche mobilité) → supprimées
    expect(result.hostFirstName).toBeUndefined();
    expect(result.phase3TutorEmail).toBeUndefined();
    expect(result.mobilityNearRelativeName).toBeUndefined();

    // 🟠 Localisation du jeune → supprimée
    expect(result.zip).toBeUndefined();
    expect(result.city).toBeUndefined();

    // PII des parents → régénérée
    expect(result.parent1Email).not.toEqual(o.parent1Email);
    expect(result.parent1FirstName).not.toEqual(o.parent1FirstName);

    // Secret d'authentification → effacé
    expect(result.password).toEqual("");

    // Garde whitelist : les champs techniques légitimes ne doivent PAS sauter
    // (sinon le code lisant status:DELETED / cohort:"-" casserait en silence).
    expect(result.status).toEqual(o.status);
    expect(result.cohort).toEqual(o.cohort);
  });
});

describe("anonymize (application) — rupture du lien + masquage", () => {
  it("rompt youngId et masque la PII du jeune", () => {
    const app: any = getNewApplicationFixture();
    app.justificatifsFiles = ["justif.pdf"]; // pour vérifier le vidage des fichiers

    const o = { youngId: app.youngId, youngEmail: app.youngEmail, youngFirstName: app.youngFirstName };
    Object.values(o).forEach((value) => expect(value).toBeTruthy());

    const result: any = anonymizeApplication(app);

    // Le lien vers le jeune est rompu : ses candidatures ne sont plus listables.
    expect(result.youngId).toBeUndefined();
    // PII masquée
    expect(result.youngEmail).toMatch(MASKED_EMAIL);
    expect(result.youngFirstName).toMatch(ONLY_STARS);
    expect(result.youngFirstName).not.toEqual(o.youngFirstName);
    // Fichiers vidés
    expect(result.justificatifsFiles).toEqual([]);
  });
});

describe("anonymize (contract) — rupture du lien + masquage", () => {
  it("rompt youngId, masque la PII et efface les tokens", () => {
    const contract: any = getNewContractFixture();

    const o = {
      youngId: contract.youngId,
      youngEmail: contract.youngEmail,
      parent1Email: contract.parent1Email,
      structureManagerEmail: contract.structureManagerEmail,
      youngFirstName: contract.youngFirstName,
    };
    Object.values(o).forEach((value) => expect(value).toBeTruthy());

    const result: any = anonymizeContract(contract);

    // Lien rompu
    expect(result.youngId).toBeUndefined();
    // Emails masqués (jeune, parent, manager de structure)
    expect(result.youngEmail).toEqual(STAR_EMAIL);
    expect(result.parent1Email).toEqual(STAR_EMAIL);
    expect(result.structureManagerEmail).toEqual(STAR_EMAIL);
    // Nom masqué
    expect(result.youngFirstName).toMatch(ONLY_STARS);
    expect(result.youngFirstName).not.toEqual(o.youngFirstName);
    // Tokens de signature effacés
    expect(result.parent1Token).toEqual("");
    expect(result.youngContractToken).toEqual("");
  });
});

describe("buildUpdate (script) — traduction undefined → $unset", () => {
  it("met les valeurs définies dans $set", () => {
    expect(buildUpdate({ a: 1, b: "x" })).toEqual({ $set: { a: 1, b: "x" } });
  });

  it("met les valeurs undefined dans $unset", () => {
    expect(buildUpdate({ a: undefined, b: undefined })).toEqual({ $unset: { a: "", b: "" } });
  });

  it("scinde défini → $set et undefined → $unset", () => {
    expect(buildUpdate({ keep: "v", drop: undefined })).toEqual({ $set: { keep: "v" }, $unset: { drop: "" } });
  });

  it("ignore toujours _id (jamais modifié)", () => {
    const update = buildUpdate({ _id: "abc", drop: undefined });
    expect(update.$set).toBeUndefined();
    expect(update.$unset).toEqual({ drop: "" });
    expect(JSON.stringify(update)).not.toContain("_id");
  });

  it("n'émet pas de clé vide ($set seul, ou $unset seul)", () => {
    expect(buildUpdate({ a: 1 })).not.toHaveProperty("$unset");
    expect(buildUpdate({ a: undefined })).not.toHaveProperty("$set");
  });
});
