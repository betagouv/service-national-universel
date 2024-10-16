import { FILLING_RATE_LIMIT, getCompletionObjectifDepartement, getCompletionObjectifStats } from "./inscription-goal";
import { YoungModel, InscriptionGoalModel } from "../models";
import { FUNCTIONAL_ERRORS } from "snu-lib";

describe("getCompletionObjectifDepartement", () => {
  it("should return the correct filling rate", async () => {
    // Arrange
    const department = "Department1";
    const cohort = "Cohort2023";
    const youngCount = 50;
    const maxGoal = 100;

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(youngCount),
    });

    InscriptionGoalModel.findOne = jest.fn().mockReturnValue({
      department,
      cohort,
      max: maxGoal,
    });

    // Act
    const result = await getCompletionObjectifDepartement(department, cohort);

    // Assert
    expect(result.tauxRemplissage).toBe(0.5);
    expect(YoungModel.find).toHaveBeenCalledWith({ department, status: { $in: ["VALIDATED"] }, cohort });
    expect(InscriptionGoalModel.findOne).toHaveBeenCalledWith({ department, cohort });
  });

  it("should throw an error when inscription goal is not defined", async () => {
    // Arrange
    const department = "Department1";
    const cohort = "Cohort2023";

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(0),
    });

    InscriptionGoalModel.findOne = jest.fn().mockReturnValue(null);

    // Act & Assert
    await expect(getCompletionObjectifDepartement(department, cohort)).rejects.toThrow(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
    expect(YoungModel.find).toHaveBeenCalledWith({ department, status: { $in: ["VALIDATED"] }, cohort });
    expect(InscriptionGoalModel.findOne).toHaveBeenCalledWith({ department, cohort });
  });
});

describe("getCompletionObjectifStats", () => {
  it("should return the correct inscription goal", async () => {
    const department = "Test Department";
    const cohort = "Test Cohort";
    const count = 50;
    const max = 100;

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(count),
    });

    InscriptionGoalModel.findOne = jest.fn().mockResolvedValue({ max });
    InscriptionGoalModel.aggregate = jest.fn().mockResolvedValue([{ total: max }]);

    const stats = await getCompletionObjectifStats(department, cohort);

    expect(stats.department.jeunesCount).toBe(count);
    expect(stats.department.objectif).toBe(max);
    expect(stats.department.tauxRemplissage).toBe(0.5);
    expect(stats.tauxLimiteRemplissage).toBe(FILLING_RATE_LIMIT);
  });

  it("should handle no inscription goal", async () => {
    const department = "Test Department";
    const cohort = "Test Cohort";

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(0),
    });

    InscriptionGoalModel.findOne = jest.fn().mockResolvedValue(null);
    InscriptionGoalModel.aggregate = jest.fn().mockResolvedValue([]);

    await expect(getCompletionObjectifStats(department, cohort)).rejects.toThrow(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
  });
});
