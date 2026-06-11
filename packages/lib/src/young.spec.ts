import { shouldDisplayNonEligibleBanner } from "./young";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE2 } from "./constants/constants";
import { COHORTS } from "./constants/cohort";

const buildYoung = (overrides = {}) => ({
  status: YOUNG_STATUS.VALIDATED,
  statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
  ...overrides,
});

const buildCohort = (overrides = {}) => ({
  name: "Juin 2024",
  dateStart: "2024-06-03T00:00:00.000Z",
  ...overrides,
});

describe("shouldDisplayNonEligibleBanner", () => {
  it("devrait retourner true pour un volontaire 2024 validé sans phase 2 validée", () => {
    expect(shouldDisplayNonEligibleBanner(buildYoung(), buildCohort())).toBe(true);
  });

  it("devrait retourner true pour un volontaire 2025 désisté avec phase 2 en cours", () => {
    const young = buildYoung({ status: YOUNG_STATUS.WITHDRAWN, statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS });
    const cohort = buildCohort({ name: "2025 HTS 02 - Février", dateStart: "2025-02-15T00:00:00.000Z" });
    expect(shouldDisplayNonEligibleBanner(young, cohort)).toBe(true);
  });

  it("devrait retourner true quand la phase 2 est désistée (WITHDRAWN)", () => {
    const young = buildYoung({ statusPhase2: YOUNG_STATUS_PHASE2.WITHDRAWN });
    expect(shouldDisplayNonEligibleBanner(young, buildCohort())).toBe(true);
  });

  it("devrait retourner false quand la phase 2 est validée (équivalence comprise)", () => {
    const young = buildYoung({ statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED });
    expect(shouldDisplayNonEligibleBanner(young, buildCohort())).toBe(false);
  });

  it("devrait retourner false pour une cohorte 2023", () => {
    const cohort = buildCohort({ name: "Juin 2023", dateStart: "2023-06-12T00:00:00.000Z" });
    expect(shouldDisplayNonEligibleBanner(buildYoung(), cohort)).toBe(false);
  });

  it("devrait retourner false pour une cohorte 2026", () => {
    const cohort = buildCohort({ name: "2026 HTS 01", dateStart: "2026-02-10T00:00:00.000Z" });
    expect(shouldDisplayNonEligibleBanner(buildYoung(), cohort)).toBe(false);
  });

  it("devrait retourner false pour la cohorte « à venir » même avec une date en 2024", () => {
    const cohort = buildCohort({ name: COHORTS.AVENIR, dateStart: "2024-06-03T00:00:00.000Z" });
    expect(shouldDisplayNonEligibleBanner(buildYoung(), cohort)).toBe(false);
  });

  it.each([YOUNG_STATUS.REFUSED, YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_ELIGIBLE, YOUNG_STATUS.ABANDONED, YOUNG_STATUS.WAITING_VALIDATION])(
    "devrait retourner false pour un compte au statut %s",
    (status) => {
      expect(shouldDisplayNonEligibleBanner(buildYoung({ status }), buildCohort())).toBe(false);
    },
  );

  it("devrait retourner false sans young ou sans cohorte", () => {
    expect(shouldDisplayNonEligibleBanner(undefined, buildCohort())).toBe(false);
    expect(shouldDisplayNonEligibleBanner(buildYoung(), undefined)).toBe(false);
    expect(shouldDisplayNonEligibleBanner(null, null)).toBe(false);
  });

  it("devrait retourner false si la cohorte n'a pas de dateStart", () => {
    expect(shouldDisplayNonEligibleBanner(buildYoung(), buildCohort({ dateStart: undefined }))).toBe(false);
  });

  it("devrait accepter un dateStart de type Date (année extraite en UTC)", () => {
    expect(shouldDisplayNonEligibleBanner(buildYoung(), buildCohort({ dateStart: new Date("2025-01-01T00:00:00.000Z") }))).toBe(true);
    expect(shouldDisplayNonEligibleBanner(buildYoung(), buildCohort({ dateStart: new Date("2026-01-01T00:00:00.000Z") }))).toBe(false);
  });
});
