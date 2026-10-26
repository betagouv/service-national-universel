import { isCohortInscriptionOpen } from "./cohortService";
import { CohortType } from "snu-lib";

jest.mock("../models", () => ({
  CohortModel: {
    findOne: jest.fn(),
  },
}));

describe("isCohortInscriptionOpen", () => {
  it("should return true if inscription is open and false otherwise", () => {
    const cohortOpen = {
      snuId: "testCohortOpen",
      inscriptionStartDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      inscriptionEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    } as CohortType;
    const cohortNotStarted = {
      snuId: "testCohortClosed",
      inscriptionStartDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      inscriptionEndDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
    } as CohortType;

    const cohortClosed = {
      snuId: "testCohortClosed",
      inscriptionStartDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
      inscriptionEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    } as CohortType;

    const cohortJustClosed = {
      snuId: "testCohortClosed",
      inscriptionStartDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
      inscriptionEndDate: new Date(Date.now() - 60),
    } as CohortType;

    const cohortOpenButCloseInSeconds = {
      snuId: "testCohortOpen",
      inscriptionStartDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
      inscriptionEndDate: new Date(Date.now() + 60),
    } as CohortType;

    expect(isCohortInscriptionOpen(cohortOpen)).toBe(true);
    expect(isCohortInscriptionOpen(cohortNotStarted)).toBe(false);
    expect(isCohortInscriptionOpen(cohortClosed)).toBe(false);
    expect(isCohortInscriptionOpen(cohortJustClosed)).toBe(false);
    expect(isCohortInscriptionOpen(cohortOpenButCloseInSeconds)).toBe(true);
  });
});
