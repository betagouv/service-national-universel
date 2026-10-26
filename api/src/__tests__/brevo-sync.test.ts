import fetch from "node-fetch";
import { capture } from "../sentry";
import { sync, syncContact } from "../brevo";

jest.mock("node-fetch", () => jest.fn());
jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
// Le limiteur réel ne remet son compteur à zéro qu'après 10 appels, via un setInterval d'une seconde :
// au-delà, les appels de ce fichier seraient différés et fuiraient d'un test à l'autre.
jest.mock("../rateLimiters", () => ({
  rateLimiterContactSIB: { call: (fn: () => unknown) => Promise.resolve(fn()) },
  rateLimiterDeleteContactSIB: { call: (fn: () => unknown) => Promise.resolve(fn()) },
}));
jest.mock("../config", () => ({
  config: {
    ENVIRONMENT: "production",
    ENABLE_SENDINBLUE: true,
    SENDINBLUEKEY: "test-key",
    ENABLE_FLATTEN_ERROR_LOGS: false,
    ENABLE_SENTRY: false,
    LOG_LEVEL: "error",
    MAIL_TRANSPORT: "BREVO",
  },
}));

const TOKEN_40 = "a".repeat(40);
const OTHER_TOKEN_40 = "b".repeat(40);
const REFERENT_ID = "64a0f1c2b3d4e5f60718293a";
const YOUNG_ID = "64b1f1c2b3d4e5f60718293b";

const brevoInvalidParameter = { code: "invalid_parameter", message: "email is invalid" };

function mockBrevoResponse(body: unknown) {
  (fetch as unknown as jest.Mock).mockResolvedValue({
    headers: { raw: () => ({ "content-type": ["application/json"] }) },
    json: async () => body,
  });
}

async function flush() {
  for (let i = 0; i < 10; i++) await new Promise((resolve) => setImmediate(resolve));
}

function capturedErrors(): { error: Error; context: unknown }[] {
  return (capture as jest.Mock).mock.calls.map(([error, context]) => ({ error, context }));
}

function serialized({ error, context }: { error: Error; context: unknown }): string {
  return `${String(error)} ${error.stack ?? ""} ${JSON.stringify(context ?? null)}`;
}

function brevoRequestBodies(): string[] {
  return (fetch as unknown as jest.Mock).mock.calls.map(([, options]) => String(options?.body ?? ""));
}

const referentFixture = {
  _id: REFERENT_ID,
  email: "jean.dupont@example.org",
  firstName: "Jean",
  lastName: "Dupont",
  role: "referent_department",
  region: "Bretagne",
  token2FA: "123456",
  token2FAExpires: "2026-09-08T10:00:00.000Z",
  invitationToken: TOKEN_40,
  forgotPasswordResetToken: OTHER_TOKEN_40,
  registredAt: "2024-01-01T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("brevo contact sync error reporting", () => {
  it("reports a Brevo failure with the document id and the Brevo error, never the contact attributes", async () => {
    mockBrevoResponse(brevoInvalidParameter);

    await syncContact(
      "jean.dupont@example.org",
      { TOKEN2FA: "123456", INVITATIONTOKEN: TOKEN_40, FORGOTPASSWORDRESETTOKEN: OTHER_TOKEN_40, REGION: "Bretagne", TYPE: "REFERENT" },
      [1448],
      { id: REFERENT_ID, type: "REFERENT", contact: "self" },
    );

    const errors = capturedErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0].error).toBeInstanceOf(Error);
    const text = serialized(errors[0]);
    expect(text).toContain("invalid_parameter");
    expect(text).toContain("email is invalid");
    expect(text).toContain(REFERENT_ID);
    expect(text).toContain("1448");
    expect(text).not.toContain(TOKEN_40);
    expect(text).not.toContain(OTHER_TOKEN_40);
    expect(text).not.toContain("123456");
    expect(text).not.toContain("jean.dupont");
    expect(text).not.toContain("Bretagne");
  });

  it("reports a missing Brevo response without the contact attributes", async () => {
    mockBrevoResponse(undefined);

    await syncContact("jean.dupont@example.org", { INVITATIONTOKEN: TOKEN_40 }, [1448], { id: REFERENT_ID, type: "REFERENT", contact: "self" });

    const errors = capturedErrors();
    expect(errors).toHaveLength(1);
    const text = serialized(errors[0]);
    expect(text).toContain(REFERENT_ID);
    expect(text).not.toContain(TOKEN_40);
    expect(text).not.toContain("jean.dupont");
  });

  it("reports a network failure without the contact body nor the api key", async () => {
    (fetch as unknown as jest.Mock).mockRejectedValue(new Error("ETIMEDOUT"));

    await sync(referentFixture, "referent", { force: true });
    await flush();

    const errors = capturedErrors();
    expect(errors.length).toBeGreaterThan(0);
    for (const captured of errors) {
      const text = serialized(captured);
      expect(text).not.toContain(TOKEN_40);
      expect(text).not.toContain(OTHER_TOKEN_40);
      expect(text).not.toContain("123456");
      expect(text).not.toContain("jean.dupont");
      expect(text).not.toContain("test-key");
    }
    expect(errors.map(serialized).join(" ")).toContain("/contacts");
  });

  it("identifies a referent by its _id when sync fails", async () => {
    mockBrevoResponse(brevoInvalidParameter);

    await sync(referentFixture, "referent", { force: true });
    await flush();

    const errors = capturedErrors();
    expect(errors).toHaveLength(1);
    const text = serialized(errors[0]);
    expect(text).toContain(REFERENT_ID);
    expect(text).toContain("REFERENT");
    expect(text).toContain("invalid_parameter");
    expect(text).not.toContain(TOKEN_40);
    expect(text).not.toContain(OTHER_TOKEN_40);
    expect(text).not.toContain("123456");
    expect(text).not.toContain("jean.dupont");
    expect(text).not.toContain("Dupont");
  });

  it("identifies a parent contact by the young _id and the parent slot, never by its email", async () => {
    mockBrevoResponse(brevoInvalidParameter);
    const young = {
      _id: YOUNG_ID,
      email: "eleve@example.org",
      firstName: "Léa",
      lastName: "Martin",
      status: "VALIDATED",
      parent1Email: "parent1@example.org",
      invitationToken: TOKEN_40,
      registredAt: "2024-01-01T00:00:00.000Z",
    };

    await sync(young, "young", { force: true });
    await flush();

    const errors = capturedErrors();
    expect(errors).toHaveLength(2);
    const texts = errors.map(serialized);
    expect(texts.some((text) => text.includes("parent1"))).toBe(true);
    for (const text of texts) {
      expect(text).toContain(YOUNG_ID);
      expect(text).not.toContain(TOKEN_40);
      expect(text).not.toContain("parent1@");
      expect(text).not.toContain("eleve@");
      expect(text).not.toContain("Martin");
    }
  });
});

describe("brevo contact attributes", () => {
  it("never sends secrets of the document as contact attributes", async () => {
    mockBrevoResponse({ id: 1 });

    await sync(referentFixture, "referent", { force: true });
    await flush();

    const bodies = brevoRequestBodies();
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).not.toContain(TOKEN_40);
    expect(bodies[0]).not.toContain(OTHER_TOKEN_40);
    expect(bodies[0]).not.toContain("123456");

    const sent = JSON.parse(bodies[0]);
    expect(sent.attributes.INVITATIONTOKEN).toBeUndefined();
    expect(sent.attributes.TOKEN2FA).toBeUndefined();
    expect(sent.attributes.FORGOTPASSWORDRESETTOKEN).toBeUndefined();
    // les attributs métier restent
    expect(sent.attributes.REGION).toBe("Bretagne");
    expect(sent.attributes.TYPE).toBe("REFERENT");
    expect(sent.email).toBe("jean.dupont@example.org");
  });
});

const youngWithHealthData = {
  _id: YOUNG_ID,
  email: "eleve@example.org",
  firstName: "Léa",
  lastName: "Martin",
  status: "VALIDATED",
  registredAt: "2024-01-01T00:00:00.000Z",
  cohort: "Juillet 2024",
  department: "Finistère",
  region: "Bretagne",
  // données de santé
  handicap: "true",
  allergies: "Allergie aux arachides",
  ppsBeneficiary: "true",
  paiBeneficiary: "true",
  medicosocialStructureName: "IME Les Tilleuls",
  medicosocialStructureAddress: "3 rue des Lilas",
  specificAmenagment: "true",
  specificAmenagmentType: "Besoin d'un accompagnant permanent",
  psc1Info: "true",
  // identité / contact
  birthdateAt: "2008-04-12T00:00:00.000Z",
  address: "12 rue de la Paix",
  zip: "29200",
  city: "Brest",
  phone: "0612345678",
  parent1Email: "parent1@example.org",
  parent1FirstName: "Claude",
  parent1LastName: "Martin",
  parent1Phone: "0698765432",
  parent2Email: "parent2@example.org",
  parent2FirstName: "Dominique",
  parent2LastName: "Martin",
  parent2Phone: "0687654321",
};

describe("H7 - fuite du document métier vers Brevo", () => {
  it("n'envoie pas les données de santé du jeune à Brevo", async () => {
    mockBrevoResponse({ id: 1 });

    await sync(youngWithHealthData, "young", { force: true });
    await flush();

    const selfBody = brevoRequestBodies()[0];
    const attributes = JSON.parse(selfBody).attributes;

    expect(attributes.ALLERGIES).toBeUndefined();
    expect(attributes.HANDICAP).toBeUndefined();
    expect(attributes.PPSBENEFICIARY).toBeUndefined();
    expect(attributes.PAIBENEFICIARY).toBeUndefined();
    expect(attributes.MEDICOSOCIALSTRUCTURENAME).toBeUndefined();
    expect(attributes.SPECIFICAMENAGMENTTYPE).toBeUndefined();
    expect(attributes.PSC1INFO).toBeUndefined();
    expect(selfBody).not.toContain("arachides");
    expect(selfBody).not.toContain("Les Tilleuls");
  });

  it("n'envoie pas au contact parent les données du jeune ni celles de l'autre parent", async () => {
    mockBrevoResponse({ id: 1 });

    await sync(youngWithHealthData, "young", { force: true });
    await flush();

    const bodies = brevoRequestBodies().map((body) => JSON.parse(body));
    const parent1 = bodies.find((body) => body.email === "parent1@example.org");
    expect(parent1).toBeDefined();

    // santé du jeune
    expect(JSON.stringify(parent1.attributes)).not.toContain("arachides");
    expect(parent1.attributes.HANDICAP).toBeUndefined();
    // coordonnées de l'autre parent
    expect(parent1.attributes.PARENT2EMAIL).toBeUndefined();
    expect(parent1.attributes.PARENT2PHONE).toBeUndefined();
    // adresse et téléphone du jeune
    expect(parent1.attributes.ADDRESS).toBeUndefined();
    expect(parent1.attributes.PHONE).toBeUndefined();
    expect(parent1.attributes.BIRTHDATEAT).toBeUndefined();
    expect(parent1.attributes.BIRTHDATEAT).toBeUndefined();
  });

  it("conserve les attributs de ciblage marketing", async () => {
    mockBrevoResponse({ id: 1 });

    await sync(youngWithHealthData, "young", { force: true });
    await flush();

    const bodies = brevoRequestBodies().map((body) => JSON.parse(body));
    const self = bodies.find((body) => body.email === "eleve@example.org");
    expect(self.attributes).toEqual({
      COHORT: "Juillet 2024",
      DEPARTMENT: "Finistère",
      REGION: "Bretagne",
      STATUS: "VALIDATED",
      PRENOM: "Léa",
      NOM: "Martin",
      TYPE: "YOUNG",
      REGISTRED: false,
    });

    const parent1 = bodies.find((body) => body.email === "parent1@example.org");
    expect(parent1.attributes).toEqual({
      COHORT: "Juillet 2024",
      DEPARTMENT: "Finistère",
      REGION: "Bretagne",
      STATUS: "VALIDATED",
      PRENOM: "Léa",
      NOM: "Martin",
      TYPE: "YOUNG",
      REGISTRED: false,
    });
  });
});
