import {
    add,
    addHours,
    addMonths,
    differenceInYears,
    endOfDay,
    format,
    isAfter as isAfterFns,
    isBefore as isBeforeFns,
    isValid,
    isWithinInterval as isWithinIntervalFns,
    parse,
    startOfDay,
} from "date-fns";

import { getZonedDate } from "snu-lib";

import { Injectable } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";

@Injectable()
export class ClockProvider implements ClockGateway {
    now(options?: { timeZone: string }) {
        if (options?.timeZone) {
            return this.getZonedDate(new Date(), options.timeZone);
        } else {
            return this.getZonedDate(new Date(), "UTC");
        }
    }
    getZonedDate(date: Date, timeZone: string = "Europe/Paris") {
        return getZonedDate(date, timeZone);
    }
    isValidDate(date: Date): boolean {
        return !isNaN(new Date(date).getTime());
    }
    isValidDateFormat(date: string, format: string): boolean {
        try {
            const parsed = parse(date, format, new Date());
            return isValid(parsed);
        } catch (error) {
            return false;
        }
    }
    parseDate(date: string, format: string): Date {
        return parse(date, format, new Date());
    }
    formatShort(date: Date): string {
        return format(date, "dd/MM/yyyy");
    }
    formatDateTime(date: Date): string {
        return format(date, "yyyy-MM-dd'T'HH:mm:ss");
    }
    formatSafeDateTime(date: Date): string {
        return `${this.formatDateTime(date)?.replaceAll(":", "-")?.replace(".", "-")}`;
    }
    isAfter(dateA: Date, dateB: Date) {
        return isAfterFns(dateA, dateB);
    }
    isBefore(dateA: Date, dateB: Date) {
        return isBeforeFns(dateA, dateB);
    }
    isWithinInterval(date: Date, params: { start: Date; end: Date }) {
        return isWithinIntervalFns(date, params);
    }
    computeAge(dateNaissance: Date) {
        return differenceInYears(this.now(), dateNaissance);
    }
    addHours(date: Date, hours: number): Date {
        return addHours(date, hours);
    }
    addDaysToNow(days: number): Date {
        return add(new Date(), { days });
    }
    addDays(date: Date, days: number): Date {
        return add(date, { days });
    }
    addMonths(date: Date, months: number): Date {
        return addMonths(date, months);
    }
    endOfDay(date: Date): Date {
        return endOfDay(date);
    }
    startOfDay(date: Date): Date {
        return startOfDay(date);
    }
    // Legacy format for compatibility
    parseDateNaissance(date: string): Date {
        return new Date(`${date.split("/")[2]}-${date.split("/")[1]}-${date.split("/")[0]}T00:00:00.000+00:00`);
    }
    isValidFrenchDate(date: string): boolean {
        if (!date || typeof date !== "string") {
            return false;
        }

        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!dateRegex.test(date)) {
            return false;
        }

        const parsed = parse(date, "dd/MM/yyyy", new Date());
        return isValid(parsed);
    }
}
