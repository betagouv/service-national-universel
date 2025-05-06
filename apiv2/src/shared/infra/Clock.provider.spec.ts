// Clock.provider.test.ts
import { ClockProvider } from "./Clock.provider";
import { add, parse } from "date-fns";

describe("ClockProvider", () => {
    let clockProvider: ClockProvider;

    beforeEach(() => {
        clockProvider = new ClockProvider();
    });

    describe("formatSafeDateTime", () => {
        it("should format the date correctly", () => {
            const date = clockProvider.getZonedDate(new Date("2024-10-01T12:34:56.789Z"));
            const formattedDate = clockProvider.formatSafeDateTime(date);
            expect(formattedDate).toBe("2024-10-01T14-34-56");
        });
    });

    describe("addDaysToNow", () => {
        it("should add the specified number of days to the current date", () => {
            const daysToAdd = 5;
            const now = new Date();
            const expectedDate = add(now, { days: daysToAdd });
            const resultDate = clockProvider.addDaysToNow(daysToAdd);
            expect(resultDate.toUTCString()).toEqual(expectedDate.toUTCString());
        });
    });

    describe("getZonedDate", () => {
        it("should return zoned date", () => {
            let date = clockProvider.getZonedDate(new Date("2024-06-03T00:00:00.000+00:00"));
            expect(clockProvider.formatDateTime(date)).toBe("2024-06-03T02:00:00");

            date = clockProvider.getZonedDate(new Date("2024-05-26T00:00:00.000Z"), "America/Martinique");
            expect(clockProvider.formatDateTime(date)).toBe("2024-05-25T20:00:00");
        });
    });

    describe("now", () => {
        it("should return a date", () => {
            const result = clockProvider.now();
            expect(result instanceof Date).toBe(true);
        });

        it("should respect the provided timezone", () => {
            const resultUTC = clockProvider.now();
            const resultMartinique = clockProvider.now({ timeZone: "America/Martinique" });

            // Time zones should be different
            expect(resultUTC.getTime()).not.toBe(resultMartinique.getTime());
        });
    });

    describe("isValidDate", () => {
        it("should return true for valid dates", () => {
            expect(clockProvider.isValidDate(new Date("2024-01-01"))).toBe(true);
        });

        it("should return false for invalid dates", () => {
            expect(clockProvider.isValidDate(new Date("invalid-date"))).toBe(false);
        });
    });

    describe("isValidDateFormat", () => {
        it("should return true for valid date format", () => {
            expect(clockProvider.isValidDateFormat("01/01/2024", "dd/MM/yyyy")).toBe(true);
        });

        it("should return false for invalid date format", () => {
            expect(clockProvider.isValidDateFormat("2024/01/01", "dd/MM/yyyy")).toBe(false);
        });
    });

    describe("parseDate", () => {
        it("should parse date from string with the given format", () => {
            const result = clockProvider.parseDate("01/01/2024", "dd/MM/yyyy");
            const expected = parse("01/01/2024", "dd/MM/yyyy", new Date());
            expect(result.toISOString()).toBe(expected.toISOString());
        });
    });

    describe("formatShort", () => {
        it("should format the date in short format", () => {
            const date = new Date("2024-01-01T00:00:00Z");
            expect(clockProvider.formatShort(date)).toBe("01/01/2024");
        });
    });

    describe("isAfter", () => {
        it("should return true when first date is after second date", () => {
            const dateA = new Date("2024-02-01");
            const dateB = new Date("2024-01-01");
            expect(clockProvider.isAfter(dateA, dateB)).toBe(true);
        });

        it("should return false when first date is not after second date", () => {
            const dateA = new Date("2024-01-01");
            const dateB = new Date("2024-02-01");
            expect(clockProvider.isAfter(dateA, dateB)).toBe(false);
        });
    });

    describe("isBefore", () => {
        it("should return true when first date is before second date", () => {
            const dateA = new Date("2024-01-01");
            const dateB = new Date("2024-02-01");
            expect(clockProvider.isBefore(dateA, dateB)).toBe(true);
        });

        it("should return false when first date is not before second date", () => {
            const dateA = new Date("2024-02-01");
            const dateB = new Date("2024-01-01");
            expect(clockProvider.isBefore(dateA, dateB)).toBe(false);
        });
    });

    describe("isWithinInterval", () => {
        it("should return true when date is within interval", () => {
            const date = new Date("2024-02-15");
            const interval = {
                start: new Date("2024-02-01"),
                end: new Date("2024-02-28"),
            };
            expect(clockProvider.isWithinInterval(date, interval)).toBe(true);
        });

        it("should return false when date is outside interval", () => {
            const date = new Date("2024-03-15");
            const interval = {
                start: new Date("2024-02-01"),
                end: new Date("2024-02-28"),
            };
            expect(clockProvider.isWithinInterval(date, interval)).toBe(false);
        });
    });

    describe("addHours", () => {
        it("should add the specified number of hours to the date", () => {
            const date = new Date("2024-01-01T12:00:00Z");
            const hours = 5;
            const expectedDate = new Date("2024-01-01T17:00:00Z");
            expect(clockProvider.addHours(date, hours).toISOString()).toBe(expectedDate.toISOString());
        });
    });

    describe("formatBirthDate", () => {
        it("should format birth date correctly", () => {
            const birthDate = "08/01/2008";
            const formattedBirthDate = clockProvider.parseDateNaissance(birthDate);
            expect(formattedBirthDate).toStrictEqual(new Date("2008-01-08T00:00:00.000+00:00"));
        });
    });
});
