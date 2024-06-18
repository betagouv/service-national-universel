import { formatCohortPeriod, getCohortPeriod } from "./sessions";

describe("sessions", () => {
  it("cohort period should return valid formatted period", () => {
    let formattedPeriod = getCohortPeriod({ name: "MyCohort", dateStart: "2024-06-03T00:00:00.000+00:00", dateEnd: "2024-06-14T00:00:00.000+00:00" });
    expect(formattedPeriod).toBe("du 3 au 14 juin 2024");
    formattedPeriod = getCohortPeriod({ name: "MyCohort", dateStart: "2024-06-03T00:00:00.000+00:00", dateEnd: "2024-06-14T00:00:00.000+00:00" }, true);
    expect(formattedPeriod).toBe("du <b>3 au 14 juin 2024</b>");
  });

  it("cohort period should return valid short formatted period", () => {
    let formattedPeriod = formatCohortPeriod({ name: "MyCohort", dateStart: "2024-05-26T00:00:00.000Z", dateEnd: "2024-06-07T00:00:00.000Z" }, "long");
    expect(formattedPeriod).toBe("du 26 mai au 7 juin 2024");
    formattedPeriod = formatCohortPeriod({ name: "MyCohort", dateStart: "2024-05-26T00:00:00.000Z", dateEnd: "2024-06-07T00:00:00.000Z" }, "short");
    expect(formattedPeriod).toBe("26/05 > 07/06");
    formattedPeriod = formatCohortPeriod({ name: "MyCohort", dateStart: "2024-05-26T00:00:00.000Z", dateEnd: "2024-06-07T00:00:00.000Z" });
    expect(formattedPeriod).toBe("26/05 > 07/06");
  });
});
