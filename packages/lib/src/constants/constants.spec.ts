import { COHORT_STATUS, COHORT_STATUS_LIST } from "./constants";

describe("COHORT_STATUS", () => {
  it("should have FULLY_ARCHIVED status", () => {
    expect(COHORT_STATUS.FULLY_ARCHIVED).toBe("FULLY_ARCHIVED");
  });

  it("should include FULLY_ARCHIVED in COHORT_STATUS_LIST", () => {
    expect(COHORT_STATUS_LIST).toContain("FULLY_ARCHIVED");
  });
});

