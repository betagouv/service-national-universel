const { canSenderJoinTicket, knownThreadParticipants, normalizeEmail } = require("../utils/imapTicketMatching");

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

describe("canSenderJoinTicket", () => {
  const ticket = { contactEmail: "alice@example.com", copyRecipient: ["bob@example.com"] };

  it("autorise le contact du ticket, quelle que soit la casse", () => {
    expect(canSenderJoinTicket(ticket, "ALICE@example.com")).toBe(true);
  });

  it("autorise une adresse déjà en copie du ticket", () => {
    expect(canSenderJoinTicket(ticket, "bob@example.com")).toBe(true);
  });

  it("refuse un tiers", () => {
    expect(canSenderJoinTicket(ticket, "attaquant@evil.tld")).toBe(false);
  });

  it("refuse quand l'expéditeur est absent", () => {
    expect(canSenderJoinTicket(ticket, undefined)).toBe(false);
    expect(canSenderJoinTicket(ticket, "")).toBe(false);
  });

  it("refuse quand le ticket est absent", () => {
    expect(canSenderJoinTicket(null, "alice@example.com")).toBe(false);
  });

  it("ne confond pas une adresse qui contient celle du contact", () => {
    expect(canSenderJoinTicket(ticket, "alice@example.com.evil.tld")).toBe(false);
  });
});
