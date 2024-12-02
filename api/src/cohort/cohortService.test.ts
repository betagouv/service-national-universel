import { CohortModel } from "../models";
import { findCohortBySnuIdOrThrow, isCohortInscriptionOpen } from "./cohortService";
import { CohortType, ERRORS } from "snu-lib";

jest.mock("../models", () => ({
  CohortModel: {
    findOne: jest.fn(),
  },
}));

describe("findCohortBySnuIdOrThrow", () => {
  it("should return the cohort if it exists", async () => {
    const mockCohort = { snuId: "testCohort" };
    (CohortModel.findOne as jest.Mock).mockResolvedValue(mockCohort);

    const result = await findCohortBySnuIdOrThrow("testCohort");

    expect(result).toEqual(mockCohort);
  });

  it("should throw an error if the cohort does not exist", async () => {
    (CohortModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(findCohortBySnuIdOrThrow("nonexistentCohort")).rejects.toThrow(ERRORS.COHORT_NOT_FOUND);
  });
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
