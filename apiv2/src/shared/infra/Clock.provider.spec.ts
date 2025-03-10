// Clock.provider.test.ts
import { ClockProvider } from "./Clock.provider";
import { add } from "date-fns";

describe("ClockProvider", () => {
    let clockProvider: ClockProvider;

    beforeEach(() => {
        clockProvider = new ClockProvider();
    });

    describe("formatSafeDateTime", () => {
        it("should format the date correctly", () => {
            const date = new Date("2024-10-01T12:34:56.789Z");
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
            expect(resultDate).toEqual(expectedDate);
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
});
