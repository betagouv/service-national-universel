import { canDeleteStructure, canUpdateMeetingPoint, ROLES } from "../roles";

// GOO-188 (relecture A de GOO-159/M26) : `sameGeography` indexait `region2department[actor?.region]`
// sans `?.` avant `.includes(...)`. Pour un acteur dont la région ne correspond à aucune clé de
// `region2department` (absente, mal orthographiée), l'expression levait une exception au lieu de
// refuser proprement — 500 au lieu de 403 sur toute route protégée par `referentInSameGeography`.
describe("GOO-188 — sameGeography refuse proprement une région inconnue au lieu de lever une exception", () => {
  const cibleHorsTerritoire = { department: "Rhône", region: "Auvergne-Rhône-Alpes" } as any;

  it("canDeleteStructure refuse (false) un référent départemental dont la région est inconnue, sur une structure hors de son département", () => {
    const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["Loire-Atlantique"], region: "Région inconnue" } as any;

    expect(() => canDeleteStructure(actor, cibleHorsTerritoire)).not.toThrow();
    expect(canDeleteStructure(actor, cibleHorsTerritoire)).toBe(false);
  });

  it("canDeleteStructure refuse un référent régional dont la région est inconnue, sur une structure d'une autre région", () => {
    const actor = { role: ROLES.REFERENT_REGION, region: "Région inconnue" } as any;

    // `sameGeography` renvoie directement `actorAndTargetInTheSameRegion` pour ce rôle : avec le
    // fix, une région inconnue donne `undefined` (opérande droite du `||`), pas `false` — refus
    // tout aussi propre dans les `if (!canDeleteStructure(...))` de tous les appelants, mais pas
    // une égalité stricte à `false`.
    expect(() => canDeleteStructure(actor, cibleHorsTerritoire)).not.toThrow();
    expect(canDeleteStructure(actor, cibleHorsTerritoire)).toBeFalsy();
  });

  it("canUpdateMeetingPoint refuse un référent régional dont la région est inconnue, sur un point de rassemblement d'une autre région", () => {
    const actor = { role: ROLES.REFERENT_REGION, region: "Région inconnue" } as any;
    const meetingPoint = { department: "Rhône", region: "Auvergne-Rhône-Alpes" } as any;

    expect(() => canUpdateMeetingPoint(actor, meetingPoint)).not.toThrow();
    expect(canUpdateMeetingPoint(actor, meetingPoint)).toBeFalsy();
  });

  it("laisse toujours un référent régional sur sa propre région (non-régression)", () => {
    const actor = { role: ROLES.REFERENT_REGION, region: "Auvergne-Rhône-Alpes" } as any;
    const cibleMemeRegion = { department: "Rhône", region: "Auvergne-Rhône-Alpes" } as any;

    expect(canDeleteStructure(actor, cibleMemeRegion)).toBe(true);
  });
});
