import { format } from "date-fns-tz";
import { formatDateFRTimezoneUTC, getZonedDate, isNowBetweenDates, formatDateTimeZone } from "./date";

describe("dates", () => {
  it("should return zoned date", () => {
    let date = getZonedDate("2024-06-03T00:00:00.000+00:00");
    expect(format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS")).toBe("2024-06-03T02:00:00.000");

    date = getZonedDate("2024-05-26T00:00:00.000Z", "America/Martinique");
    expect(format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS")).toBe("2024-05-25T20:00:00.000");
  });
  it("formatDateFRTimezoneUTC", () => {
    let date = formatDateFRTimezoneUTC("2024-06-03T23:00:00.000+00:00");
    expect(date).toBe("03/06/2024");
    date = formatDateFRTimezoneUTC("2024-06-03T01:00:00.000+00:00");
    expect(date).toBe("03/06/2024");
    date = formatDateFRTimezoneUTC("2024-06-03T00:00:00.000+00:00");
    expect(date).toBe("03/06/2024");
    date = formatDateFRTimezoneUTC("2024-06-03T18:00:00.000+00:00");
    expect(date).toBe("03/06/2024");
  });
  it("should return true when calling isNowBetweenDates", () => {
    const from = new Date();
    const to = new Date();
    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() + 1);
    expect(isNowBetweenDates(from.toISOString(), to.toISOString())).toBe(true);
  });
  it("should return false when calling isNowBetweenDates", () => {
    const from = new Date();
    const to = new Date();
    from.setDate(from.getDate() - 2);
    to.setDate(to.getDate() - 1);
    expect(isNowBetweenDates(from.toISOString(), to.toISOString())).toBe(false);
  });
  it("should return true when calling isNowBetweenDates with 'to' and 'from' undefined", () => {
    expect(isNowBetweenDates(undefined, undefined)).toBe(true);
  });
  it("should return true when calling isNowBetweenDates with 'from' equals undefined", () => {
    const to = new Date();
    to.setDate(to.getDate() + 1);
    expect(isNowBetweenDates(undefined, to.toISOString())).toBe(true);
  });
  it("should return true when calling isNowBetweenDates with 'to' equals undefined", () => {
    const from = new Date();
    from.setDate(from.getDate() - 1);
    expect(isNowBetweenDates(from.toISOString(), undefined)).toBe(true);
  });
  it("formatDateTimeZone", () => {
    let date = formatDateTimeZone("2024-06-03T23:00:00.000+00:00");
    expect(date.toISOString()).toBe("2024-06-03T23:00:00.000Z");

    date = formatDateTimeZone("2024-06-03T01:00:00.000+00:00");
    expect(date.toISOString()).toBe("2024-06-03T01:00:00.000Z");

    date = formatDateTimeZone("2024-06-03T00:00:00.000+00:00");
    expect(date.toISOString()).toBe("2024-06-03T00:00:00.000Z");

    date = formatDateTimeZone("2024-06-03T18:00:00.000+00:00");
    expect(date.toISOString()).toBe("2024-06-03T18:00:00.000Z");
  });
});
