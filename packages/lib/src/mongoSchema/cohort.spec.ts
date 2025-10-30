import { COHORT_STATUS, COHORT_STATUS_LIST } from "../constants/constants";
import { CohortSchema } from "./cohort";

describe("CohortSchema", () => {
  it("should have FULLY_ARCHIVED in enum list", () => {
    expect(CohortSchema.status.enum).toContain("FULLY_ARCHIVED");
  });

  it("should have FULLY_ARCHIVED in COHORT_STATUS_LIST used by schema", () => {
    expect(COHORT_STATUS_LIST).toContain(COHORT_STATUS.FULLY_ARCHIVED);
  });
});

