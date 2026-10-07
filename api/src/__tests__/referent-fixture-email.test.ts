import { getNewReferentFixture, getNewSignupReferentFixture, getReinscriptionSignupReferentFixture } from "./fixtures/referent";

// GOO-190 : faker.internet.email() ne garantit pas l'unicité entre deux appels,
// ce qui provoquait une collision E11000 occasionnelle sur l'index unique
// `email` des référents en base de test — y compris entre deux lancements
// locaux successifs (la base de test n'est jamais purgée entre deux runs).
// Un suffixe UUID donne une entropie suffisante indépendamment du nombre de
// runs déjà exécutés, contrairement à un compteur de process qui repart à
// zéro à chaque run (constat relevé en relecture A).
const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

describe("fixtures référent — unicité de l'email (GOO-190)", () => {
  it("getNewReferentFixture intègre un UUID dans l'email généré", () => {
    const fixture = getNewReferentFixture();
    expect(fixture.email).toMatch(UUID_PATTERN);
  });

  it("getNewSignupReferentFixture intègre un UUID dans l'email généré", () => {
    const fixture = getNewSignupReferentFixture();
    expect(fixture.email).toMatch(UUID_PATTERN);
  });

  it("getReinscriptionSignupReferentFixture intègre un UUID dans l'email généré", () => {
    const fixture = getReinscriptionSignupReferentFixture();
    expect(fixture.email).toMatch(UUID_PATTERN);
  });

  it("respecte un email explicitement fourni (override)", () => {
    const fixture = getNewReferentFixture({ email: "jean.dupont@example.org" });
    expect(fixture.email).toEqual("jean.dupont@example.org");
  });
});
