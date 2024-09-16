import { formatCohortPeriod, getCohortPeriod } from "./sessions";

describe("sessions", () => {
  it("should return valid formatted period for same month and year", () => {
    let formattedPeriod = getCohortPeriod({
      name: "MyCohort",
      dateStart: "2024-06-03T00:00:00.000+00:00",
      dateEnd: "2024-06-14T00:00:00.000+00:00",
    });
    expect(formattedPeriod).toBe("du 3 au 14 juin 2024");

    formattedPeriod = getCohortPeriod({
      name: "MyCohort",
      dateStart: "2024-06-03T00:00:00.000+00:00",
      dateEnd: "2024-06-14T00:00:00.000+00:00",
    }, true);
    expect(formattedPeriod).toBe("<b>du 3 au 14 juin 2024</b>");
  });

  it("should return valid formatted period for different months in the same year", () => {
    let formattedPeriod = getCohortPeriod({
      name: "MyCohort",
      dateStart: "2024-05-26T00:00:00.000+00:00",
      dateEnd: "2024-06-07T00:00:00.000+00:00",
    });
    expect(formattedPeriod).toBe("du 26 mai au 7 juin 2024");

    formattedPeriod = getCohortPeriod({
      name: "MyCohort",
      dateStart: "2024-05-26T00:00:00.000+00:00",
      dateEnd: "2024-06-07T00:00:00.000+00:00",
    }, true);
    expect(formattedPeriod).toBe("<b>du 26 mai au 7 juin 2024</b>");
  });

  it("should return valid formatted period for different years", () => {
    let formattedPeriod = getCohortPeriod({
      name: "MyCohort",
      dateStart: "2024-12-28T00:00:00.000+00:00",
      dateEnd: "2025-01-10T00:00:00.000+00:00",
    });
    expect(formattedPeriod).toBe("du 28 décembre 2024 au 10 janvier 2025");

    formattedPeriod = getCohortPeriod({
      name: "MyCohort",
      dateStart: "2024-12-28T00:00:00.000+00:00",
      dateEnd: "2025-01-10T00:00:00.000+00:00",
    }, true);
    expect(formattedPeriod).toBe("<b>du 28 décembre 2024 au 10 janvier 2025</b>");
  });

  it("should return cohort name if dates are missing", () => {
    let formattedPeriod = getCohortPeriod({ name: "MyCohort" });
    expect(formattedPeriod).toBe("MyCohort");

    formattedPeriod = getCohortPeriod({ name: "MyCohort", dateStart: null, dateEnd: null });
    expect(formattedPeriod).toBe("MyCohort");
  });

  it("should return 'à venir' if cohort name is 'à venir'", () => {
    const formattedPeriod = getCohortPeriod({ name: "à venir" });
    expect(formattedPeriod).toBe("à venir");
  });

  it("should return short formatted period", () => {
    const formattedPeriod = formatCohortPeriod({
      name: "MyCohort",
      dateStart: "2024-05-26T00:00:00.000+00:00",
      dateEnd: "2024-06-07T00:00:00.000+00:00",
    }, "short");
    expect(formattedPeriod).toBe("26/05 > 07/06");
  });

  it("should return long formatted period", () => {
    const formattedPeriod = formatCohortPeriod({
      name: "MyCohort",
      dateStart: "2024-05-26T00:00:00.000+00:00",
      dateEnd: "2024-06-07T00:00:00.000+00:00",
    }, "long");
    expect(formattedPeriod).toBe("du 26 mai au 7 juin 2024");
  });

  it("should return short format if no format specified", () => {
    const formattedPeriod = formatCohortPeriod({
      name: "MyCohort",
      dateStart: "2024-05-26T00:00:00.000+00:00",
      dateEnd: "2024-06-07T00:00:00.000+00:00",
    });
    expect(formattedPeriod).toBe("26/05 > 07/06");
  });
});
