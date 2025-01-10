export interface ClockGateway {
    addDaysToNow(days: number): Date;
    now(): Date;
    getNowSafeIsoDate(): string;
}

export const ClockGateway = Symbol("ClockGateway");
