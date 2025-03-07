import {
    add,
    addHours,
    differenceInYears,
    format,
    isAfter as isAfterFns,
    isBefore as isBeforeFns,
    isWithinInterval as isWithinIntervalFns,
} from "date-fns";

import { getZonedDate } from "snu-lib";

import { Injectable } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";

@Injectable()
export class ClockProvider implements ClockGateway {
    formatSafeIsoDate(date: Date): string {
        return `${date.toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
    }
    addDaysToNow(days: number): Date {
        return add(new Date(), { days });
    }
    now({ timeZone }: { timeZone?: string } = { timeZone: "Europe/Paris" }) {
        return getZonedDate(new Date(), timeZone);
    }
    isValidDate(date: Date): boolean {
        return !isNaN(new Date(date).getTime());
    }
    formatShort(date: Date): string {
        return format(date, "dd/MM/yyyy");
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
}
