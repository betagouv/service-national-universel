import { format } from "date-fns-tz";
import { formatDateFRTimezoneUTC, getZonedDate, isNowBetweenDates, formatDateTimeZone, clampTimeZoneOffset, getDateTimeByTimeZoneOffset } from "./date";

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

// M100 (audit du 21/09/2026) : le décalage vient de l'en-tête client `x-user-timezone`.
describe("clampTimeZoneOffset", () => {
  it("conserve un décalage de fuseau réel", () => {
    expect(clampTimeZoneOffset(-120)).toBe(-120);
    expect(clampTimeZoneOffset(600)).toBe(600);
    expect(clampTimeZoneOffset(840)).toBe(840);
    expect(clampTimeZoneOffset(-840)).toBe(-840);
  });

  it("borne un décalage hors des limites d'un fuseau réel", () => {
    expect(clampTimeZoneOffset(43200)).toBe(840);
    expect(clampTimeZoneOffset(-525600)).toBe(-840);
    expect(clampTimeZoneOffset(Infinity)).toBe(840);
  });

  it("vaut 0 pour une valeur non numérique", () => {
    expect(clampTimeZoneOffset(NaN)).toBe(0);
    expect(clampTimeZoneOffset(null)).toBe(0);
    expect(clampTimeZoneOffset(undefined)).toBe(0);
  });
});

describe("getDateTimeByTimeZoneOffset", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-23T12:00:00.000Z"));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("retranche le décalage fourni", () => {
    expect(getDateTimeByTimeZoneOffset(-120).toISOString()).toBe("2026-09-23T14:00:00.000Z");
    expect(getDateTimeByTimeZoneOffset(null).toISOString()).toBe("2026-09-23T12:00:00.000Z");
  });

  it("ne déplace jamais « maintenant » de plus de 14 heures", () => {
    // 43 200 minutes = 30 jours : la valeur servait à rouvrir une fenêtre d'inscription close.
    expect(getDateTimeByTimeZoneOffset(43200).toISOString()).toBe("2026-09-22T22:00:00.000Z");
    expect(getDateTimeByTimeZoneOffset(-525600).toISOString()).toBe("2026-09-24T02:00:00.000Z");
  });
});
