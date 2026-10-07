import { fakerFR as faker } from "@faker-js/faker";

import { getNewReferentFixture, getNewSignupReferentFixture, getReinscriptionSignupReferentFixture } from "./fixtures/referent";

// GOO-190 : faker.internet.email() peut renvoyer deux fois la même valeur dans un
// même run (pas de garantie d'unicité inter-appel), ce qui provoque une collision
// E11000 occasionnelle sur l'index unique `email` des référents en base de test.
describe("getNewReferentFixture — unicité de l'email (GOO-190)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("génère des emails différents même si faker.internet.email() renvoie la même valeur deux fois", () => {
    jest.spyOn(faker.internet, "email").mockReturnValue("collision@example.com");

    const a = getNewReferentFixture();
    const b = getNewReferentFixture();

    expect(faker.internet.email).toHaveBeenCalled();
    expect(a.email).not.toEqual(b.email);
  });

  it("respecte un email explicitement fourni (override)", () => {
    const fixture = getNewReferentFixture({ email: "jean.dupont@example.org" });
    expect(fixture.email).toEqual("jean.dupont@example.org");
  });

  it("getNewSignupReferentFixture génère aussi des emails différents sous collision faker", () => {
    jest.spyOn(faker.internet, "email").mockReturnValue("collision@example.com");

    const a = getNewSignupReferentFixture();
    const b = getNewSignupReferentFixture();

    expect(a.email).not.toEqual(b.email);
  });

  it("getReinscriptionSignupReferentFixture génère aussi des emails différents sous collision faker", () => {
    jest.spyOn(faker.internet, "email").mockReturnValue("collision@example.com");

    const a = getReinscriptionSignupReferentFixture();
    const b = getReinscriptionSignupReferentFixture();

    expect(a.email).not.toEqual(b.email);
  });
});
