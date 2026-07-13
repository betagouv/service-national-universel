const { formatProgress } = require("../scripts/purgeContacts.helpers");

describe("formatProgress (barre de progression par objet)", () => {
  const totals = { contacts: 20, tickets: 210, messages: 950, files: 24 };

  it("barre vide au départ (0%)", () => {
    const line = formatProgress({ contacts: 0, tickets: 0, messages: 0, files: 0 }, totals, 10);
    expect(line).toBe("[░░░░░░░░░░] 0/1204 objets (0%) — contacts 0/20 · tickets 0/210 · messages 0/950 · files 0/24");
  });

  it("barre pleine à la fin (100%)", () => {
    const line = formatProgress({ contacts: 20, tickets: 210, messages: 950, files: 24 }, totals, 10);
    expect(line).toBe("[██████████] 1204/1204 objets (100%) — contacts 20/20 · tickets 210/210 · messages 950/950 · files 24/24");
  });

  it("avancement intermédiaire : ratio, pourcentage et détail par type", () => {
    const done = { contacts: 8, tickets: 96, messages: 402, files: 6 }; // 512 / 1204 = 42%
    const line = formatProgress(done, totals, 30);
    expect(line).toContain("512/1204 objets (42%)");
    expect(line).toContain("contacts 8/20");
    expect(line).toContain("tickets 96/210");
    expect(line).toContain("messages 402/950");
    expect(line).toContain("files 6/24");
    // 42% de 30 ≈ 13 blocs pleins
    expect(line).toContain("█".repeat(13) + "░".repeat(17));
  });

  it("total à 0 → 0% sans division par zéro, barre vide", () => {
    const zero = { contacts: 0, tickets: 0, messages: 0, files: 0 };
    const line = formatProgress(zero, zero, 10);
    expect(line).toBe("[░░░░░░░░░░] 0/0 objets (0%) — contacts 0/0 · tickets 0/0 · messages 0/0 · files 0/0");
  });
});
