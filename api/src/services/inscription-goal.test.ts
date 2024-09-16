import { FILLING_RATE_LIMIT, getInscriptionGoalStats } from "./inscription-goal";
import { YoungModel, InscriptionGoalModel } from "../models";

describe("getInscriptionGoalStats", () => {
  it("should return the correct inscription goal", async () => {
    const department = "Test Department";
    const cohort = "Test Cohort";
    const count = 50;
    const max = 100;

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(count),
    });

    InscriptionGoalModel.findOne = jest.fn().mockResolvedValue({ max });

    const stats = await getInscriptionGoalStats(department, cohort);

    expect(stats.count).toBe(count);
    expect(stats.max).toBe(max);
    expect(stats.fillingRate).toBe(0.5);
    expect(stats.rateLimit).toBe(FILLING_RATE_LIMIT);
  });

  it("should handle no inscription goal", async () => {
    const department = "Test Department";
    const cohort = "Test Cohort";

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(0),
    });

    InscriptionGoalModel.findOne = jest.fn().mockResolvedValue(null);

    const stats = await getInscriptionGoalStats(department, cohort);

    expect(stats.count).toBe(0);
    expect(stats.max).toBe(1);
    expect(stats.fillingRate).toBe(0);
    expect(stats.rateLimit).toBe(FILLING_RATE_LIMIT);
  });
});
