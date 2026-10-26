import { isAdminAccessAllowed, isAdminAccessRestrictionActive } from "./adminAccessRestriction";

const ALLOWED = "64f000000000000000000001";
const OTHER = "64f000000000000000000002";

describe("isAdminAccessRestrictionActive", () => {
  it("est inactif sans flag", () => {
    expect(isAdminAccessRestrictionActive(null)).toBe(false);
    expect(isAdminAccessRestrictionActive(undefined)).toBe(false);
  });

  it("est actif quand le flag est activé", () => {
    expect(isAdminAccessRestrictionActive({ enabled: true })).toBe(true);
  });

  it("est inactif quand le flag est désactivé sans fenêtre", () => {
    expect(isAdminAccessRestrictionActive({ enabled: false, date: { from: null, to: null } })).toBe(false);
  });

  it("suit la fenêtre de dates", () => {
    const flag = { enabled: false, date: { from: new Date("2026-09-01"), to: new Date("2026-09-30") } };
    expect(isAdminAccessRestrictionActive(flag, new Date("2026-09-15"))).toBe(true);
    expect(isAdminAccessRestrictionActive(flag, new Date("2026-10-01"))).toBe(false);
  });
});

describe("isAdminAccessAllowed", () => {
  it("laisse passer tout le monde quand la restriction est inactive", () => {
    expect(isAdminAccessAllowed(null, { referentId: OTHER })).toBe(true);
    expect(isAdminAccessAllowed({ enabled: false, allowedReferentIds: [ALLOWED] }, { referentId: OTHER })).toBe(true);
  });

  it("ne laisse passer que la liste quand la restriction est active", () => {
    const flag = { enabled: true, allowedReferentIds: [ALLOWED] };
    expect(isAdminAccessAllowed(flag, { referentId: ALLOWED })).toBe(true);
    expect(isAdminAccessAllowed(flag, { referentId: OTHER })).toBe(false);
  });

  it("refuse tout le monde quand la restriction est active et la liste vide", () => {
    expect(isAdminAccessAllowed({ enabled: true, allowedReferentIds: [] }, { referentId: ALLOWED })).toBe(false);
    expect(isAdminAccessAllowed({ enabled: true }, { referentId: ALLOWED })).toBe(false);
  });

  it("contrôle l'administrateur réel pendant une impersonation", () => {
    const flag = { enabled: true, allowedReferentIds: [ALLOWED] };
    // Admin autorisé qui consulte un compte hors liste : accepté.
    expect(isAdminAccessAllowed(flag, { referentId: OTHER, impersonatorId: ALLOWED })).toBe(true);
    // Admin hors liste qui consulterait un compte autorisé : refusé.
    expect(isAdminAccessAllowed(flag, { referentId: ALLOWED, impersonatorId: OTHER })).toBe(false);
  });

  it("compare des ObjectId et des chaînes", () => {
    const objectIdLike = { toString: () => ALLOWED } as unknown as string;
    expect(isAdminAccessAllowed({ enabled: true, allowedReferentIds: [ALLOWED] }, { referentId: objectIdLike })).toBe(true);
  });
});
