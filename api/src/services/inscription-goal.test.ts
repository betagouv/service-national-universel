import { FILLING_RATE_LIMIT, getCompletionObjectifDepartement, getCompletionObjectifRegion, getCompletionObjectifs } from "./inscription-goal";
import { YoungModel, InscriptionGoalModel } from "../models";
import getNewCohortFixture from "../__tests__/fixtures/cohort";
import { CohortType, FUNCTIONAL_ERRORS, INSCRIPTION_GOAL_LEVELS } from "snu-lib";

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
  it("should return regional completion when objectifLevel is 'regional'", async () => {
    const department = "Test Department";
    const cohort = getNewCohortFixture({ name: "Test Cohort", objectifLevel: INSCRIPTION_GOAL_LEVELS.REGIONAL }) as CohortType;
    const count = 50;
    const maxRegion = 500;

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(count),
    });

    InscriptionGoalModel.findOne = jest.fn().mockResolvedValue({ max: 100 });
    InscriptionGoalModel.aggregate = jest.fn().mockResolvedValue([{ total: maxRegion }]);

    const stats = await getCompletionObjectifs(department, cohort);

    expect(stats.isAtteint).toBe(false);
    expect(stats.tauxRemplissage).toBe(0.1); // 50/500
    expect(stats.tauxLimiteRemplissage).toBe(FILLING_RATE_LIMIT);
  });

  it("should return departmental completion when objectifLevel is 'departemental'", async () => {
    const department = "Test Department";
    const cohort = getNewCohortFixture({ name: "Test Cohort", objectifLevel: INSCRIPTION_GOAL_LEVELS.DEPARTEMENTAL }) as CohortType;
    const count = 50;
    const maxDepartment = 100;
    const maxRegion = 500;

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(count),
    });

    InscriptionGoalModel.findOne = jest.fn().mockResolvedValue({ max: maxDepartment });
    InscriptionGoalModel.aggregate = jest.fn().mockResolvedValue([{ total: maxRegion }]);

    const stats = await getCompletionObjectifs(department, cohort);

    expect(stats.isAtteint).toBe(stats.department.isAtteint || stats.region.isAtteint);
    expect(stats.tauxRemplissage).toBe(Math.max(stats.region.tauxRemplissage, stats.department.tauxRemplissage));
    expect(stats.tauxLimiteRemplissage).toBe(FILLING_RATE_LIMIT);
  });

  it("should consider objective reached if either regional or departmental is reached for departemental level", async () => {
    const department = "Test Department";
    const cohort = getNewCohortFixture({ name: "Test Cohort", objectifLevel: INSCRIPTION_GOAL_LEVELS.DEPARTEMENTAL }) as CohortType;
    const count = 120; // Over department max
    const maxDepartment = 100;
    const maxRegion = 500;

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(count),
    });

    InscriptionGoalModel.findOne = jest.fn().mockResolvedValue({ max: maxDepartment });
    InscriptionGoalModel.aggregate = jest.fn().mockResolvedValue([{ total: maxRegion }]);

    const stats = await getCompletionObjectifs(department, cohort);

    expect(stats.department.isAtteint).toBe(true);
    expect(stats.isAtteint).toBe(true); // Should be true because department objective is reached
    expect(stats.tauxRemplissage).toBe(1.2); // 120/100
  });

  it("should only consider regional objective for regional level", async () => {
    const department = "Test Department";
    const cohort = getNewCohortFixture({ name: "Test Cohort", objectifLevel: INSCRIPTION_GOAL_LEVELS.REGIONAL }) as CohortType;
    const count = 120; // Over department max but under region max
    const maxDepartment = 100;
    const maxRegion = 500;

    YoungModel.find = jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(count),
    });

    InscriptionGoalModel.findOne = jest.fn().mockResolvedValue({ max: maxDepartment });
    InscriptionGoalModel.aggregate = jest.fn().mockResolvedValue([{ total: maxRegion }]);

    const stats = await getCompletionObjectifs(department, cohort);

    expect(stats.region.isAtteint).toBe(false);
    expect(stats.isAtteint).toBe(false); // Should be false because only regional matters
    expect(stats.tauxRemplissage).toBe(0.24); // 120/500
  });
});
