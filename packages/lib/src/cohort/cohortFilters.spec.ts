import { COHORT_STATUS } from "../constants/constants";

describe("Cohort filtering by archived status", () => {
  it("should filter out both ARCHIVED and FULLY_ARCHIVED cohorts", () => {
    const cohorts = [
      { name: "Cohort 1", status: COHORT_STATUS.PUBLISHED },
      { name: "Cohort 2", status: COHORT_STATUS.ARCHIVED },
      { name: "Cohort 3", status: COHORT_STATUS.FULLY_ARCHIVED },
    ];

    const filteredCohorts = cohorts.filter((cohort) => {
      return cohort.status !== COHORT_STATUS.ARCHIVED && cohort.status !== COHORT_STATUS.FULLY_ARCHIVED;
    });

    expect(filteredCohorts).toHaveLength(1);
    expect(filteredCohorts[0].status).toBe(COHORT_STATUS.PUBLISHED);
  });

  it("should include PUBLISHED cohorts", () => {
    const cohorts = [
      { name: "Cohort 1", status: COHORT_STATUS.PUBLISHED },
      { name: "Cohort 2", status: COHORT_STATUS.PUBLISHED },
    ];

    const filteredCohorts = cohorts.filter((cohort) => {
      return cohort.status !== COHORT_STATUS.ARCHIVED && cohort.status !== COHORT_STATUS.FULLY_ARCHIVED;
    });

    expect(filteredCohorts).toHaveLength(2);
  });
});

