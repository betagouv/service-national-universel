import { Injectable } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import {
    add,
    addHours,
    differenceInYears,
    format,
    isAfter as isAfterFns,
    isBefore as isBeforeFns,
    isWithinInterval as isWithinIntervalFns,
} from "date-fns";

@Injectable()
export class ClockProvider implements ClockGateway {
    getNowSafeIsoDate(): string {
        return `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
    }
    addDaysToNow(days: number): Date {
        return add(new Date(), { days });
    }
    now() {
        return new Date();
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
