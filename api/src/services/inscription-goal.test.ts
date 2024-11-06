import { FILLING_RATE_LIMIT, getCompletionObjectifDepartement, getCompletionObjectifRegion, getCompletionObjectifs } from "./inscription-goal";
import { YoungModel, InscriptionGoalModel } from "../models";
import { FUNCTIONAL_ERRORS } from "snu-lib";

describe("getCompletionObjectifRegion", () => {
  it("should return the completion objectif region", async () => {
    const region = "region1";
    const cohort = "cohort1";
    const total = 100;
    const jeunesCount = 50;

    InscriptionGoalModel.aggregate = jest.fn().mockResolvedValue([{ _id: "region", total }]);
    YoungModel.find = jest.fn().mockReturnThis();
    YoungModel.countDocuments = jest.fn().mockResolvedValue(jeunesCount);

    const result = await getCompletionObjectifRegion(region, cohort);

    expect(result).toEqual({
      jeunesCount,
      objectif: total,
      tauxRemplissage: 0.5,
      isAtteint: false,
    });
  });

  it("should throw an error if there is no total", async () => {
    const region = "region1";
    const cohort = "cohort1";

    InscriptionGoalModel.aggregate = jest.fn().mockResolvedValue([]);

    await expect(getCompletionObjectifRegion(region, cohort)).rejects.toThrow(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
  });
});

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

describe("getCompletionObjectifs", () => {
  it("should return the correct inscription goal", async () => {
    const department = "Test Department";
    const cohort = "Test Cohort";
    const count = 50;
    const maxDepartment = 100;
    const maxRegion = 500;

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(count),
    });

    InscriptionGoalModel.findOne = jest.fn().mockResolvedValue({ max: maxDepartment });
    InscriptionGoalModel.aggregate = jest.fn().mockResolvedValue([{ total: maxRegion }]);

    const stats = await getCompletionObjectifs(department, cohort);

    expect(stats.department.jeunesCount).toBe(count);
    expect(stats.department.objectif).toBe(maxDepartment);
    expect(stats.department.tauxRemplissage).toBe(0.5);
    expect(stats.department.isAtteint).toBe(false);
    expect(stats.region.jeunesCount).toBe(count);
    expect(stats.region.objectif).toBe(maxRegion);
    expect(stats.region.isAtteint).toBe(false);
    expect(stats.region.tauxRemplissage).toBe(0.1);
    expect(stats.isAtteint).toBe(false);
    expect(stats.tauxRemplissage).toBe(0.5);
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

    await expect(getCompletionObjectifs(department, cohort)).rejects.toThrow(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
  });
});
