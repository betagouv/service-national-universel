import { CohortModel } from "../models";
import { findCohortBySnuIdOrThrow } from "./cohortService";
import { ERRORS } from "snu-lib";

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
});
