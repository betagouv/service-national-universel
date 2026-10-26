// H86, défense en profondeur : `dest` et `copyRecipient` étaient de simples emails validés
// par Joi, sans lien avec le ticket. Avec messageHistory="all", sendEmailWithConditions
// envoie tout l'historique ET toutes les pièces jointes déchiffrées à `dest`. Le
// destinataire doit donc appartenir au fil.

const { isKnownThreadParticipant, knownThreadParticipants, normalizeEmail } = require("../utils/ticketParticipants");

describe("normalizeEmail", () => {
  it("met en minuscules et retire les espaces", () => {
    expect(normalizeEmail("  Alice@Example.COM ")).toBe("alice@example.com");
  });

  it("renvoie null pour une valeur absente ou non textuelle", () => {
    expect(normalizeEmail(undefined)).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail(42)).toBeNull();
  });
});

describe("knownThreadParticipants", () => {
  it("réunit le contact du ticket et les adresses en copie", () => {
    const ticket = { contactEmail: "Alice@example.com", copyRecipient: ["Bob@example.com", "carol@example.com"] };
    expect(knownThreadParticipants(ticket)).toEqual(["alice@example.com", "bob@example.com", "carol@example.com"]);
  });

  it("tolère un ticket sans copie ni contact", () => {
    expect(knownThreadParticipants({})).toEqual([]);
    expect(knownThreadParticipants(undefined)).toEqual([]);
  });
});

describe("isKnownThreadParticipant", () => {
  const ticket = { contactEmail: "alice@example.com", copyRecipient: ["bob@example.com"] };

  it("reconnaît le contact du ticket, quelle que soit la casse", () => {
    expect(isKnownThreadParticipant(ticket, "ALICE@example.com")).toBe(true);
  });

  it("reconnaît une adresse déjà en copie du ticket", () => {
    expect(isKnownThreadParticipant(ticket, "bob@example.com")).toBe(true);
  });

  it("refuse une adresse étrangère au fil", () => {
    expect(isKnownThreadParticipant(ticket, "attaquant@evil.tld")).toBe(false);
  });

  it("refuse une adresse qui contient seulement celle du contact", () => {
    expect(isKnownThreadParticipant(ticket, "alice@example.com.evil.tld")).toBe(false);
  });

  it("refuse quand l'adresse ou le ticket manque", () => {
    expect(isKnownThreadParticipant(ticket, undefined)).toBe(false);
    expect(isKnownThreadParticipant(ticket, "")).toBe(false);
    expect(isKnownThreadParticipant(null, "alice@example.com")).toBe(false);
  });
});
