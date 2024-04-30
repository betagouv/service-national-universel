import { getZonedDate } from "./date";

describe("dates", () => {
  it("should return zoned date", () => {
    let date = getZonedDate("2024-06-03T00:00:00.000+00:00");
    expect(date.toISOString()).toBe("2024-06-03T00:00:00.000Z");

    date = getZonedDate("2024-05-26T00:00:00.000Z", "America/Martinique");
    expect(date.toISOString()).toBe("2024-05-25T18:00:00.000Z");
  });
});
